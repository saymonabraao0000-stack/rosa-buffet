import "server-only";
import { sql } from "@/lib/db/client";

// Com NTFY_TOKEN (token de acesso de uma conta grátis do ntfy.sh), o limite
// diário passa a ser da conta. Sem ele, o ntfy.sh limita por IP — e os IPs de
// saída da Cloudflare são compartilhados: em 24/09/2026 a cota já vinha
// esgotada (429 "daily message quota reached").
function authHeader(): Record<string, string> {
  const token = process.env.NTFY_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Guarda o resultado do último envio ao ntfy no setting `ntfy_status`
// (diagnóstico: o Worker não tem log ligado por padrão). Nunca lança.
async function registrarStatusNtfy(tipo: string, resultado: Record<string, unknown>) {
  try {
    const valor = JSON.stringify({ tipo, ...resultado, em: new Date().toISOString() });
    await sql`
      insert into settings (key, value, updated_at) values ('ntfy_status', ${valor}::jsonb, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()
    `;
  } catch (err) {
    console.error("registrarStatusNtfy falhou:", err);
  }
}

// Aviso de lead novo no celular via ntfy (https://ntfy.sh): quem assina o
// tópico NTFY_TOPIC no app do ntfy recebe a notificação. O nome do tópico é o
// segredo — quem souber, lê os avisos —, por isso ele fica numa env var e a
// mensagem leva só o primeiro nome e o link da ficha (que exige login no CRM),
// nunca o telefone. Sem NTFY_TOPIC configurada, não faz nada.
export async function notifyNewLead(lead: { id: string; nome: string }, siteOrigin: string) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    await registrarStatusNtfy("novo_lead", { ok: false, erro: "NTFY_TOPIC ausente no ambiente" });
    return;
  }

  const primeiroNome = lead.nome.trim().split(/\s+/)[0] || "Alguém";
  try {
    const res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: "POST",
      body: `${primeiroNome} começou a simulação no site. Toque para abrir a ficha no CRM.`,
      headers: {
        ...authHeader(),
        Title: "Novo lead - Rosa Buffet",
        Tags: "tada",
        Priority: "high",
        Click: `${siteOrigin}/crm/leads/${lead.id}`,
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("notifyNewLead: ntfy respondeu", res.status);
    await registrarStatusNtfy("novo_lead", {
      ok: res.ok,
      status: res.status,
      ...(res.ok ? {} : { resposta: (await res.text().catch(() => "")).slice(0, 300) }),
    });
  } catch (err) {
    console.error("notifyNewLead falhou:", err);
    await registrarStatusNtfy("novo_lead", { ok: false, erro: err instanceof Error ? err.message : String(err) });
  }
}

// Aviso genérico via ntfy (usado pelo resumo diário, item 13 do plano de
// melhorias — Planos/crm-melhorias-2026-09-24.md). Mesmo comportamento de
// notifyNewLead (silencioso sem NTFY_TOPIC), mas com título/corpo livres.
// `titulo` vira o header `Title` do ntfy — evite acentos/caracteres fora do
// ASCII nele (headers HTTP), o `corpo` (body da requisição) pode ter acentos
// normalmente. Devolve `true` se o ntfy confirmou o envio.
export async function notifyText(titulo: string, corpo: string, clickUrl?: string): Promise<boolean> {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return false;

  try {
    const res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: "POST",
      body: corpo,
      headers: {
        ...authHeader(),
        Title: titulo,
        Tags: "clipboard",
        Priority: "default",
        ...(clickUrl ? { Click: clickUrl } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("notifyText: ntfy respondeu", res.status);
    await registrarStatusNtfy("texto", {
      ok: res.ok,
      status: res.status,
      ...(res.ok ? {} : { resposta: (await res.text().catch(() => "")).slice(0, 300) }),
    });
    return res.ok;
  } catch (err) {
    console.error("notifyText falhou:", err);
    await registrarStatusNtfy("texto", { ok: false, erro: err instanceof Error ? err.message : String(err) });
    return false;
  }
}
