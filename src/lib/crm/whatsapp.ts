import { getThemeLabel } from "@/lib/quiz-data";
import type { Lead } from "./types";
import { isQuizIncomplete } from "./quiz-progress";

// Link "Abrir WhatsApp" da ficha do lead, já com a primeira mensagem escrita
// (a equipe só revisa e envia).

/** Telefone só com dígitos e com o 55 do Brasil — aceita o número digitado com ou sem ele. */
export function toWhatsappNumber(telefone: string): string {
  const digits = telefone.replace(/\D/g, "");
  return digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
}

export function buildLeadWhatsappUrl(lead: Lead): string {
  const primeiroNome = lead.nome.trim().split(/\s+/)[0];
  const detalhes = [
    getThemeLabel(lead.temaSlug),
    lead.dataEvento ? formatDate(lead.dataEvento) : undefined,
  ].filter(Boolean);

  const text = isQuizIncomplete(lead)
    ? `Olá, ${primeiroNome}! Aqui é da Rosa Buffet. Vi que você começou uma simulação de festa no nosso site` +
      (detalhes.length ? ` (${detalhes.join(", ")})` : "") +
      " e não chegou a terminar. Posso te ajudar a montar o orçamento?"
    : lead.source === "quiz"
      ? `Olá, ${primeiroNome}! Aqui é da Rosa Buffet. Vi que você fez uma simulação no nosso site` +
        (detalhes.length ? ` (${detalhes.join(", ")})` : "") +
        ". Posso te ajudar com o orçamento?"
      : `Olá, ${primeiroNome}! Aqui é da Rosa Buffet. Tudo bem?`;

  return `https://wa.me/${toWhatsappNumber(lead.telefone)}?text=${encodeURIComponent(text)}`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const currencyBR = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

type TemplateVarKey = "nome" | "tema" | "data" | "valor" | "saldo" | "link_avaliacao" | "link_depoimento";
type TemplateVars = Partial<Record<TemplateVarKey, string>>;

/**
 * Preenche um modelo de WhatsApp (item 2) com as variáveis {nome} {tema}
 * {data} {valor} {saldo} {link_avaliacao} {link_depoimento}. Quando uma
 * variável não tem valor (ex.: link_depoimento ainda não existe, ou a festa
 * não tem data), a frase inteira que a contém é removida — não deixa
 * placeholder solto nem frase capenga no meio da mensagem.
 */
export function fillWhatsappTemplate(template: string, vars: TemplateVars): string {
  const emptyKeys = (Object.keys(vars) as TemplateVarKey[]).filter((key) => !vars[key]);

  let text = template;
  if (emptyKeys.length > 0) {
    text = text
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => !emptyKeys.some((key) => sentence.includes(`{${key}}`)))
      .join(" ")
      .trim();
  }

  return text.replace(/\{(\w+)\}/g, (_match, key: string) => vars[key as TemplateVarKey] ?? "");
}

/** Monta o link `wa.me` de um dos modelos configuráveis (Configurações → Mensagens de WhatsApp). */
export function buildTemplateWhatsappUrl(
  lead: Lead,
  template: string,
  opts: { linkAvaliacaoGoogle?: string; linkDepoimento?: string } = {},
): string {
  const primeiroNome = lead.nome.trim().split(/\s+/)[0];
  const faltaReceber = lead.valorFechado != null ? lead.valorFechado - lead.valorPago : null;

  const text = fillWhatsappTemplate(template, {
    nome: primeiroNome,
    tema: getThemeLabel(lead.temaSlug),
    data: lead.dataEvento ? formatDate(lead.dataEvento) : undefined,
    // {valor} nos modelos padrão se refere ao sinal (ex.: "reserva confirmada").
    valor: currencyBR.format(lead.valorSinal ?? 500),
    saldo: faltaReceber != null ? currencyBR.format(faltaReceber) : undefined,
    link_avaliacao: opts.linkAvaliacaoGoogle || undefined,
    link_depoimento: opts.linkDepoimento || undefined,
  });

  return `https://wa.me/${toWhatsappNumber(lead.telefone)}?text=${encodeURIComponent(text)}`;
}
