import type { LeadChecklist } from "./types";

/**
 * Checklist da festa (item 15) — 7 itens: cardápio, bolo, decoração, número
 * final de convidados, horário, degustação marcada e fornecedores/observações
 * (a chave `observacoes` do tipo `LeadChecklist` não é usada aqui de propósito:
 * o combinado é um único campo de texto, "fornecedores").
 */
export const CHECKLIST_TOTAL_ITENS = 7;

export function checklistProntos(checklist: LeadChecklist | null | undefined): number {
  if (!checklist) return 0;
  let count = 0;
  if (checklist.cardapioDefinido) count++;
  if (checklist.bolo) count++;
  if (checklist.decoracao) count++;
  if (checklist.numeroFinalConvidados != null) count++;
  if (checklist.horario) count++;
  if (checklist.degustacaoEm) count++;
  if (checklist.fornecedores) count++;
  return count;
}
