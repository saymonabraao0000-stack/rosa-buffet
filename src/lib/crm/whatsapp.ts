import { getThemeLabel } from "@/lib/quiz-data";
import type { Lead } from "./types";

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

  const text =
    lead.source === "quiz"
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
