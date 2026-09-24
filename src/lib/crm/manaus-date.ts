// Helpers de data em America/Manaus (UTC−4, sem horário de verão) — usados
// pelo lembrete de retorno (item 1) e pelos recortes de mês/30 dias do
// dashboard. Sem libs novas: `Intl` já resolve o fuso certo.

/** Data de hoje em Manaus, no formato "AAAA-MM-DD" (mesmo formato de `date` no Postgres). */
export function manausTodayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Manaus" }).format(new Date());
}

/** Soma (ou subtrai, com `days` negativo) dias a uma data "AAAA-MM-DD", sem depender do fuso do navegador. */
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}
