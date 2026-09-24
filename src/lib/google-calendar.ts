import "server-only";
import { sql } from "@/lib/db/client";
import { getSetting, setSetting } from "@/lib/crm/settings";
import { getThemeLabel, getPartyPackageLabel } from "@/lib/quiz-data";

/**
 * Integração com o Google Agenda (item 14 do plano —
 * Planos/crm-melhorias-2026-09-24.md). OAuth 2.0 "web application" flow
 * usando só `fetch` na REST API do Google (sem o pacote `googleapis`, que
 * não roda bem no runtime dos Cloudflare Workers) — compatível com
 * `node:crypto`/`fetch`, sem `fs`.
 *
 * Enquanto `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` não existirem (env vars
 * do Worker), tudo aqui é no-op: nada quebra, o botão em Configurações mostra
 * "Aguardando configuração".
 *
 * Guardamos só o refresh_token no setting `google_calendar` (tabela
 * `settings`) — o access_token é de curta duração (1h) e é gerado de novo a
 * cada execução (cache em memória do próprio isolate, que já ajuda dentro de
 * uma mesma requisição/execução mas não precisa sobreviver além disso).
 */

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

// Escopo `calendar.events` (criar/editar/apagar eventos, sem acesso a outras
// agendas nem a dados pessoais além disso) + `openid email` só para mostrar
// de qual conta Google o CRM está conectado em Configurações — decisão
// tomada aqui em vez de guardar só "conectado desde": ajuda a Rosilene a
// confirmar que conectou a conta certa, e o escopo openid/email não é
// "sensível" como o calendar.events (não precisa de verificação extra do
// Google para o app funcionar em modo de teste).
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "openid",
  "email",
].join(" ");

export type GoogleCalendarSetting = {
  refreshToken: string | null;
  calendarId: string;
  connectedEmail: string | null;
  connectedAt: string | null;
};

export const DEFAULT_GOOGLE_CALENDAR_SETTING: GoogleCalendarSetting = {
  refreshToken: null,
  calendarId: "primary",
  connectedEmail: null,
  connectedAt: null,
};

const SETTING_KEY = "google_calendar";

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export async function getGoogleCalendarSetting(): Promise<GoogleCalendarSetting> {
  return getSetting(SETTING_KEY, DEFAULT_GOOGLE_CALENDAR_SETTING);
}

export async function isGoogleConnected(): Promise<boolean> {
  if (!isGoogleConfigured()) return false;
  const setting = await getGoogleCalendarSetting();
  return Boolean(setting.refreshToken);
}

function redirectUri(origin: string): string {
  return `${origin}/crm/google/callback`;
}

/** Monta a URL de consentimento do Google. `state` deve ser validado no callback (CSRF). */
export function getAuthUrl(origin: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID não configurada.");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
    include_granted_scopes: "true",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
  error?: string;
  error_description?: string;
};

/** Decodifica o `id_token` (JWT) só para pegar o e-mail — sem validar assinatura (vem direto do Google via HTTPS, troca de code por token). */
function extractEmailFromIdToken(idToken: string | undefined): string | null {
  if (!idToken) return null;
  try {
    const payload = idToken.split(".")[1];
    if (!payload) return null;
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const decoded = JSON.parse(json) as { email?: string };
    return decoded.email ?? null;
  } catch {
    return null;
  }
}

/** Troca o `code` do callback por tokens e salva o refresh_token + e-mail conectado no setting. */
export async function exchangeCodeForTokens(
  code: string,
  origin: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return { ok: false, erro: "Google não configurado." };

  try {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri(origin),
        grant_type: "authorization_code",
      }),
    });
    const data = (await res.json()) as TokenResponse;
    if (!res.ok || !data.refresh_token) {
      // Sem refresh_token normalmente significa que o usuário já tinha
      // conectado antes e o Google não reenviou um novo (só acontece sem
      // `prompt=consent`, mas fica registrado aqui por segurança).
      return {
        ok: false,
        erro: data.error_description || data.error || "O Google não devolveu um refresh token.",
      };
    }

    const connectedEmail = extractEmailFromIdToken(data.id_token);
    const setting: GoogleCalendarSetting = {
      refreshToken: data.refresh_token,
      calendarId: "primary",
      connectedEmail,
      connectedAt: new Date().toISOString(),
    };
    await setSetting(SETTING_KEY, setting);
    return { ok: true };
  } catch (err) {
    console.error("exchangeCodeForTokens falhou:", err);
    return { ok: false, erro: "Falha de rede ao falar com o Google." };
  }
}

// Cache do access_token em memória, só dentro da mesma execução do worker
// (não sobrevive entre requisições diferentes, mas evita repedir token várias
// vezes na mesma chamada/lote de sincronização).
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 30_000) {
    return cachedAccessToken.token;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const setting = await getGoogleCalendarSetting();
  if (!setting.refreshToken) return null;

  try {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: setting.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const data = (await res.json()) as TokenResponse;
    if (!res.ok || !data.access_token) {
      console.error("getAccessToken: refresh falhou", data.error, data.error_description);
      return null;
    }
    cachedAccessToken = {
      token: data.access_token,
      expiresAt: now + (data.expires_in ?? 3600) * 1000,
    };
    return data.access_token;
  } catch (err) {
    console.error("getAccessToken falhou:", err);
    return null;
  }
}

export async function disconnectGoogle(): Promise<void> {
  const setting = await getGoogleCalendarSetting();
  if (setting.refreshToken) {
    try {
      await fetch(GOOGLE_REVOKE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: setting.refreshToken }),
      });
    } catch (err) {
      // Não bloqueia a desconexão local se o revoke falhar (ex.: token já
      // tinha expirado sozinho, comum em apps em modo "Testing" — 7 dias).
      console.error("disconnectGoogle: revoke falhou (ignorado):", err);
    }
  }
  await setSetting(SETTING_KEY, DEFAULT_GOOGLE_CALENDAR_SETTING);
  cachedAccessToken = null;
}

function siteOrigin(): string {
  return process.env.SITE_ORIGIN || "https://rosabuffeteventos.com.br";
}

/** Dia seguinte a uma data "AAAA-MM-DD", em string "AAAA-MM-DD" (evento de dia inteiro do Google usa end exclusivo). */
function nextDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + 1);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type LeadForSync = {
  id: string;
  nome: string;
  telefone: string;
  status: string;
  tema_slug: string | null;
  data_evento: string | null;
  estimated_guests: number | null;
  guest_range_slug: string | null;
  buffet_tier_slug: string | null;
  google_event_id: string | null;
};

function buildEventBody(lead: LeadForSync) {
  const temaLabel = getThemeLabel(lead.tema_slug) ?? "a confirmar";
  const pacoteLabel = getPartyPackageLabel(lead.buffet_tier_slug);
  const convidados = lead.estimated_guests ?? (lead.guest_range_slug ? lead.guest_range_slug : null);

  const descricaoLinhas = [
    `Telefone: ${lead.telefone}`,
    convidados != null ? `Convidados: ${convidados}` : null,
    pacoteLabel ? `Pacote: ${pacoteLabel}` : null,
    `Ficha no CRM: ${siteOrigin()}/crm/leads/${lead.id}`,
  ].filter(Boolean);

  const dataEvento = lead.data_evento as string;

  return {
    summary: `Festa – ${lead.nome} (${temaLabel})`,
    description: descricaoLinhas.join("\n"),
    start: { date: dataEvento, timeZone: "America/Manaus" },
    end: { date: nextDay(dataEvento), timeZone: "America/Manaus" },
  };
}

async function calendarFetch(
  accessToken: string,
  calendarId: string,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    },
  );
}

export type SyncResult = { ok: boolean; erro?: string; noop?: boolean };

/**
 * Sincroniza um lead com o Google Agenda:
 * - `fechado` + `data_evento` → cria (POST) ou atualiza (PUT) evento de dia
 *   inteiro, grava `google_event_id`.
 * - qualquer outro status, ou sem `data_evento`, mas com `google_event_id`
 *   salvo → apaga o evento (DELETE) e zera a coluna.
 * - sem configuração/conexão do Google → no-op (não é erro).
 *
 * Nunca lança: todo caminho de erro volta `{ ok: false, erro }`, para nunca
 * impedir a operação normal do CRM (mudar status, editar lead) por causa de
 * uma falha do Google.
 */
export async function syncLeadToGoogle(leadId: string): Promise<SyncResult> {
  try {
    if (!isGoogleConfigured()) return { ok: true, noop: true };

    const setting = await getGoogleCalendarSetting();
    if (!setting.refreshToken) return { ok: true, noop: true };

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { ok: false, erro: "Não foi possível renovar o acesso ao Google (reconecte em Configurações)." };
    }

    const rows = await sql`
      select id, nome, telefone, status, tema_slug, data_evento, estimated_guests,
             guest_range_slug, buffet_tier_slug, google_event_id
      from leads where id = ${leadId}
    `;
    const row = rows[0] as
      | (Omit<LeadForSync, "data_evento"> & { data_evento: string | Date | null })
      | undefined;
    if (!row) return { ok: false, erro: "Lead não encontrado." };

    const dataEvento =
      row.data_evento instanceof Date
        ? row.data_evento.toISOString().slice(0, 10)
        : row.data_evento;

    const lead: LeadForSync = { ...row, data_evento: dataEvento };
    const calendarId = setting.calendarId || "primary";

    const deveTerEvento = lead.status === "fechado" && Boolean(lead.data_evento);

    if (!deveTerEvento) {
      if (!lead.google_event_id) return { ok: true, noop: true };
      const res = await calendarFetch(accessToken, calendarId, `/${lead.google_event_id}`, {
        method: "DELETE",
      });
      // 404/410: evento já não existe (apagado manualmente no Google) —
      // trata como sucesso, só limpa a coluna.
      if (!res.ok && res.status !== 404 && res.status !== 410) {
        return { ok: false, erro: `Google respondeu ${res.status} ao apagar o evento.` };
      }
      await sql`update leads set google_event_id = null, updated_at = now() where id = ${leadId}`;
      return { ok: true };
    }

    const body = buildEventBody(lead);

    if (lead.google_event_id) {
      const res = await calendarFetch(accessToken, calendarId, `/${lead.google_event_id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      if (res.status === 404 || res.status === 410) {
        // Evento apagado manualmente no Google: cria de novo.
        const created = await calendarFetch(accessToken, calendarId, "", {
          method: "POST",
          body: JSON.stringify(body),
        });
        if (!created.ok) return { ok: false, erro: `Google respondeu ${created.status} ao recriar o evento.` };
        const data = (await created.json()) as { id: string };
        await sql`update leads set google_event_id = ${data.id}, updated_at = now() where id = ${leadId}`;
        return { ok: true };
      }
      if (!res.ok) return { ok: false, erro: `Google respondeu ${res.status} ao atualizar o evento.` };
      return { ok: true };
    }

    const res = await calendarFetch(accessToken, calendarId, "", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, erro: `Google respondeu ${res.status} ao criar o evento.` };
    const data = (await res.json()) as { id: string };
    await sql`update leads set google_event_id = ${data.id}, updated_at = now() where id = ${leadId}`;
    return { ok: true };
  } catch (err) {
    console.error("syncLeadToGoogle falhou:", err);
    return { ok: false, erro: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Apaga um evento pelo id — usado ao EXCLUIR um lead, quando a linha (e o
 * google_event_id que syncLeadToGoogle leria) já não existe mais. Nunca lança.
 */
export async function deleteGoogleEventById(eventId: string): Promise<SyncResult> {
  try {
    if (!isGoogleConfigured()) return { ok: true, noop: true };
    const setting = await getGoogleCalendarSetting();
    if (!setting.refreshToken) return { ok: true, noop: true };
    const accessToken = await getAccessToken();
    if (!accessToken) return { ok: false, erro: "Sem acesso ao Google." };
    const res = await calendarFetch(accessToken, setting.calendarId || "primary", `/${eventId}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 404 && res.status !== 410) {
      return { ok: false, erro: `Google respondeu ${res.status} ao apagar o evento.` };
    }
    return { ok: true };
  } catch (err) {
    console.error("deleteGoogleEventById falhou:", err);
    return { ok: false, erro: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/** Sincroniza todas as festas fechadas com data futura ou de hoje em diante — usado pelo botão "Sincronizar agora". */
export async function syncAllFechados(): Promise<{ total: number; ok: number; falhas: number }> {
  const rows = await sql`
    select id from leads
    where status = 'fechado' and data_evento is not null and data_evento >= current_date
  `;
  let ok = 0;
  let falhas = 0;
  for (const row of rows as { id: string }[]) {
    const result = await syncLeadToGoogle(row.id);
    if (result.ok && !result.noop) ok += 1;
    else if (!result.ok) falhas += 1;
  }
  return { total: rows.length, ok, falhas };
}
