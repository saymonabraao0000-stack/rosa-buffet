/**
 * Constantes de disponibilidade de data usadas pelo simulador (/orcamento).
 *
 * As datas efetivamente reservadas não vêm mais de uma lista fixa aqui —
 * vêm do CRM (leads com status "fechado" e uma data escolhida), buscadas no
 * banco por getBookedDates() em src/lib/crm/leads.ts e passadas para
 * PartyQuiz como prop. Este arquivo guarda só o que continua sendo uma
 * constante fixa do negócio.
 */

/** Valor do sinal para garantir a reserva de uma data, em reais. */
export const reservationDeposit = 500;

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
