import "server-only";
import { sql } from "@/lib/db/client";
import { sendPushToAll } from "@/lib/webpush";

// Aviso principal: Web Push nativo do próprio CRM (PWA), ver webpush.ts.
// O ntfy.sh (https://ntfy.sh) vinha recusando com 429 "daily message quota
// reached" a partir dos IPs compartilhados de saída da Cloudflare — em
// 24/09/2026 passou a ser só um envio extra opcional, mantido enquanto
// NTFY_TOPIC existir no ambiente, e nunca quebra o fluxo principal se falhar.

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

// Envio extra opcional via ntfy (https://ntfy.sh), só quando NTFY_TOPIC
// existir no ambiente. Nunca lança — uma falha aqui não pode derrubar o
// envio principal (Web Push).
async function sendNtfyExtra(tipo: string, opts: { title: string; body: string; clickUrl?: string; tags: string; priority: string }) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;

  try {
    const res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: "POST",
      body: opts.body,
      headers: {
        ...authHeader(),
        Title: opts.title,
        Tags: opts.tags,
        Priority: opts.priority,
        ...(opts.clickUrl ? { Click: opts.clickUrl } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error(`sendNtfyExtra(${tipo}): ntfy respondeu`, res.status);
  } catch (err) {
    console.error(`sendNtfyExtra(${tipo}) falhou:`, err);
  }
}

// Aviso de lead novo no celular: Web Push nativo do CRM para todos os
// aparelhos inscritos (ver webpush.ts), com a mensagem levando só o primeiro
// nome e o link da ficha (exige login no CRM), nunca o telefone. O ntfy.sh
// segue como envio extra, só se NTFY_TOPIC estiver configurada.
export async function notifyNewLead(lead: { id: string; nome: string }, siteOrigin: string) {
  const primeiroNome = lead.nome.trim().split(/\s+/)[0] || "Alguém";
  const clickUrl = `${siteOrigin}/crm/leads/${lead.id}`;
  const body = `${primeiroNome} começou a simulação no site. Toque para abrir a ficha no CRM.`;

  try {
    const { enviados, falhas } = await sendPushToAll({ title: "Novo lead - Rosa Buffet", body, url: `/crm/leads/${lead.id}`, tag: "novo-lead" });
    await registrarStatusNtfy("novo_lead", { ok: enviados > 0 || falhas === 0, enviados, falhas });
  } catch (err) {
    console.error("notifyNewLead (push) falhou:", err);
    await registrarStatusNtfy("novo_lead", { ok: false, erro: err instanceof Error ? err.message : String(err) });
  }

  await sendNtfyExtra("novo_lead", { title: "Novo lead - Rosa Buffet", body, clickUrl, tags: "tada", priority: "high" });
}

// Aviso genérico (usado pelo resumo diário e pelo alerta de lead sem
// resposta): Web Push nativo do CRM para todos os aparelhos inscritos, mais
// o ntfy.sh como envio extra opcional. Devolve `true` se o push confirmou
// pelo menos um envio (ou se não havia nenhum aparelho, para não travar o
// caller em loop de retry).
export async function notifyText(titulo: string, corpo: string, clickUrl?: string): Promise<boolean> {
  let pushOk = true;
  try {
    const { enviados, falhas } = await sendPushToAll({ title: titulo, body: corpo, url: clickUrl });
    pushOk = falhas === 0 || enviados > 0;
    await registrarStatusNtfy("texto", { ok: pushOk, enviados, falhas });
  } catch (err) {
    console.error("notifyText (push) falhou:", err);
    pushOk = false;
    await registrarStatusNtfy("texto", { ok: false, erro: err instanceof Error ? err.message : String(err) });
  }

  await sendNtfyExtra("texto", { title: titulo, body: corpo, clickUrl, tags: "clipboard", priority: "default" });

  return pushOk;
}
