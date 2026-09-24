import "server-only";
import { sql } from "@/lib/db/client";
import { LEAD_ORIGENS, type LeadOrigem, type LeadStatus } from "./types";
import { QUIZ_DONE_STEPS } from "./quiz-progress";

// Todos os limites de mês são calculados em America/Manaus, convertendo o
// timestamp UTC do banco com `at time zone 'America/Manaus'` antes de
// comparar com o mês pedido — evita que uma festa/lead do fim do dia (fuso
// de Manaus) caia no mês errado.

/** "AAAA-MM" -> { anterior, atual } em "AAAA-MM". */
function mesAnterior(mesISO: string): string {
  const [ano, mes] = mesISO.split("-").map(Number);
  const dt = new Date(Date.UTC(ano, mes - 1, 1));
  dt.setUTCMonth(dt.getUTCMonth() - 1);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Lista os últimos `n` meses "AAAA-MM" terminando (inclusive) em `mesISO`, em ordem crescente. */
function ultimosMeses(mesISO: string, n: number): string[] {
  const [ano, mes] = mesISO.split("-").map(Number);
  const meses: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(Date.UTC(ano, mes - 1 - i, 1));
    meses.push(`${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return meses;
}

export type RelatorioPorOrigem = {
  origem: LeadOrigem | null;
  leads: number;
  fechados: number;
  conversaoPct: number; // 0-100
};

export type RelatorioFunilItem = {
  status: LeadStatus;
  total: number;
};

export type RelatorioFaturamentoMes = {
  mes: string; // "AAAA-MM"
  total: number;
};

export type RelatorioMes = {
  mes: string; // "AAAA-MM"
  leadsNoMes: number;
  leadsMesAnterior: number;
  variacaoLeadsPct: number | null; // null quando não dá pra calcular (mês anterior sem leads)
  porOrigem: RelatorioPorOrigem[];
  funil: RelatorioFunilItem[];
  tempoRespostaMedioHoras: number | null;
  tempoRespostaMedianaHoras: number | null;
  respondidosEm1hPct: number | null;
  quizIncompletos: number;
  faturamentoMes: number;
  faturamentoUltimos6Meses: RelatorioFaturamentoMes[];
  festasRealizadasNoMes: number;
};

const STATUS_ORDEM: LeadStatus[] = ["novo", "contatado", "orcamento_enviado", "fechado", "perdido"];

/** Conta leads criados num mês (fuso Manaus). */
async function countLeadsNoMes(mesISO: string): Promise<number> {
  const rows = await sql`
    select count(*)::int as total from leads
    where to_char(created_at at time zone 'America/Manaus', 'YYYY-MM') = ${mesISO}
  `;
  return rows[0]?.total ?? 0;
}

async function getPorOrigem(mesISO: string): Promise<RelatorioPorOrigem[]> {
  const rows = await sql`
    select origem, count(*)::int as leads,
      count(*) filter (where status = 'fechado')::int as fechados
    from leads
    where to_char(created_at at time zone 'America/Manaus', 'YYYY-MM') = ${mesISO}
    group by origem
    order by leads desc
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map((r) => ({
    origem: r.origem as LeadOrigem | null,
    leads: r.leads,
    fechados: r.fechados,
    conversaoPct: r.leads > 0 ? Math.round((r.fechados / r.leads) * 1000) / 10 : 0,
  }));
}

async function getFunil(mesISO: string): Promise<RelatorioFunilItem[]> {
  const rows = await sql`
    select status, count(*)::int as total from leads
    where to_char(created_at at time zone 'America/Manaus', 'YYYY-MM') = ${mesISO}
    group by status
  `;
  const porStatus: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of rows as any[]) porStatus[row.status] = row.total;
  return STATUS_ORDEM.map((status) => ({ status, total: porStatus[status] ?? 0 }));
}

async function getTempoResposta(mesISO: string): Promise<{
  mediaHoras: number | null;
  medianaHoras: number | null;
  respondidosEm1hPct: number | null;
}> {
  const rows = await sql`
    select
      extract(epoch from (primeiro_contato_em - created_at)) / 3600.0 as horas
    from leads
    where to_char(created_at at time zone 'America/Manaus', 'YYYY-MM') = ${mesISO}
      and primeiro_contato_em is not null
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const horas = (rows as any[]).map((r) => Number(r.horas)).filter((h) => Number.isFinite(h) && h >= 0);
  if (horas.length === 0) {
    return { mediaHoras: null, medianaHoras: null, respondidosEm1hPct: null };
  }

  const soma = horas.reduce((a, b) => a + b, 0);
  const media = soma / horas.length;

  const ordenado = [...horas].sort((a, b) => a - b);
  const meio = Math.floor(ordenado.length / 2);
  const mediana =
    ordenado.length % 2 === 0 ? (ordenado[meio - 1] + ordenado[meio]) / 2 : ordenado[meio];

  const em1h = horas.filter((h) => h <= 1).length;
  const pct = Math.round((em1h / horas.length) * 1000) / 10;

  return {
    mediaHoras: Math.round(media * 10) / 10,
    medianaHoras: Math.round(mediana * 10) / 10,
    respondidosEm1hPct: pct,
  };
}

/** Simulações que pararam no meio, entre os leads do quiz criados no mês (mesma regra de quiz-progress.ts). */
async function getQuizIncompletos(mesISO: string): Promise<number> {
  const rows = await sql`
    select count(*)::int as total from leads
    where source = 'quiz'
      and to_char(created_at at time zone 'America/Manaus', 'YYYY-MM') = ${mesISO}
      and coalesce(current_step, 'contato') <> all(${QUIZ_DONE_STEPS})
  `;
  return rows[0]?.total ?? 0;
}

/** Faturamento: soma de valor_fechado das festas fechadas com data_evento no mês. */
async function getFaturamentoMes(mesISO: string): Promise<number> {
  const rows = await sql`
    select coalesce(sum(valor_fechado), 0)::int as total from leads
    where status = 'fechado' and data_evento is not null
      and to_char(data_evento, 'YYYY-MM') = ${mesISO}
  `;
  return rows[0]?.total ?? 0;
}

async function getFaturamentoUltimos6Meses(mesISO: string): Promise<RelatorioFaturamentoMes[]> {
  const meses = ultimosMeses(mesISO, 6);
  const rows = await sql`
    select to_char(data_evento, 'YYYY-MM') as mes, coalesce(sum(valor_fechado), 0)::int as total
    from leads
    where status = 'fechado' and data_evento is not null
      and to_char(data_evento, 'YYYY-MM') = any(${meses})
    group by mes
  `;
  const porMes: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of rows as any[]) porMes[row.mes] = row.total;
  return meses.map((mes) => ({ mes, total: porMes[mes] ?? 0 }));
}

/** Festas realizadas no mês: fechadas com data_evento dentro do mês (já ocorridas ou não — é a agenda do mês). */
async function getFestasRealizadasNoMes(mesISO: string): Promise<number> {
  const rows = await sql`
    select count(*)::int as total from leads
    where status = 'fechado' and data_evento is not null
      and to_char(data_evento, 'YYYY-MM') = ${mesISO}
  `;
  return rows[0]?.total ?? 0;
}

export async function getRelatorioMes(mesISO: string): Promise<RelatorioMes> {
  const mesAnteriorISO = mesAnterior(mesISO);

  const [
    leadsNoMes,
    leadsMesAnterior,
    porOrigem,
    funil,
    tempoResposta,
    quizIncompletos,
    faturamentoMes,
    faturamentoUltimos6Meses,
    festasRealizadasNoMes,
  ] = await Promise.all([
    countLeadsNoMes(mesISO),
    countLeadsNoMes(mesAnteriorISO),
    getPorOrigem(mesISO),
    getFunil(mesISO),
    getTempoResposta(mesISO),
    getQuizIncompletos(mesISO),
    getFaturamentoMes(mesISO),
    getFaturamentoUltimos6Meses(mesISO),
    getFestasRealizadasNoMes(mesISO),
  ]);

  const variacaoLeadsPct =
    leadsMesAnterior > 0
      ? Math.round(((leadsNoMes - leadsMesAnterior) / leadsMesAnterior) * 1000) / 10
      : null;

  return {
    mes: mesISO,
    leadsNoMes,
    leadsMesAnterior,
    variacaoLeadsPct,
    porOrigem,
    funil,
    tempoRespostaMedioHoras: tempoResposta.mediaHoras,
    tempoRespostaMedianaHoras: tempoResposta.medianaHoras,
    respondidosEm1hPct: tempoResposta.respondidosEm1hPct,
    quizIncompletos,
    faturamentoMes,
    faturamentoUltimos6Meses,
    festasRealizadasNoMes,
  };
}

export { LEAD_ORIGENS };
