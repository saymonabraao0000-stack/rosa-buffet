/**
 * Datas já reservadas por outros eventos.
 *
 * O site é estático (sem banco de dados), então esta lista precisa ser
 * atualizada à mão pela equipe da Rosa Buffet sempre que uma data for
 * reservada ou liberada — ela não reflete a agenda real automaticamente.
 * Enquanto estiver vazia, o simulador trata todas as datas futuras como
 * disponíveis.
 *
 * Formato de cada item: "AAAA-MM-DD".
 */
export const bookedDates: string[] = [
  // TODO: preencher com as datas já reservadas da Rosa Buffet.
];

/** Valor do sinal para garantir a reserva de uma data, em reais. */
export const reservationDeposit = 500;

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isDateBooked(date: Date): boolean {
  return bookedDates.includes(formatISODate(date));
}
