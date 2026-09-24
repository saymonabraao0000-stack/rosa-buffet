import "server-only";

// Aviso de lead novo no celular via ntfy (https://ntfy.sh): quem assina o
// tópico NTFY_TOPIC no app do ntfy recebe a notificação. O nome do tópico é o
// segredo — quem souber, lê os avisos —, por isso ele fica numa env var e a
// mensagem leva só o primeiro nome e o link da ficha (que exige login no CRM),
// nunca o telefone. Sem NTFY_TOPIC configurada, não faz nada.
export async function notifyNewLead(lead: { id: string; nome: string }, siteOrigin: string) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;

  const primeiroNome = lead.nome.trim().split(/\s+/)[0] || "Alguém";
  try {
    const res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: "POST",
      body: `${primeiroNome} começou a simulação no site. Toque para abrir a ficha no CRM.`,
      headers: {
        Title: "Novo lead - Rosa Buffet",
        Tags: "tada",
        Priority: "high",
        Click: `${siteOrigin}/crm/leads/${lead.id}`,
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("notifyNewLead: ntfy respondeu", res.status);
  } catch (err) {
    console.error("notifyNewLead falhou:", err);
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
        Title: titulo,
        Tags: "clipboard",
        Priority: "default",
        ...(clickUrl ? { Click: clickUrl } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("notifyText: ntfy respondeu", res.status);
    return res.ok;
  } catch (err) {
    console.error("notifyText falhou:", err);
    return false;
  }
}
