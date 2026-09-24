import "server-only";
import { sql } from "@/lib/db/client";
import { QUIZ_DONE_STEPS } from "./quiz-progress";
import { manausTodayISO, addDaysISO } from "./manaus-date";
import { getPedidosDeAvaliacao } from "./pos-festa";

// Resumo diário do CRM (item 13 do plano, Planos/crm-melhorias-2026-09-24.md)
// e base da "festa do ano que vem" (item 8). Consultas próprias, separadas de
// leads.ts (outro agente mexe nele em paralelo) — nada aqui grava no banco,
// só lê. Helpers de "hoje em Manaus" e soma de dias vêm de manaus-date.ts
// (compartilhado com o resto do CRM); só `addMonths`/`nextAnniversary`, que
// só a recompra usa, ficam aqui.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asDateString(value: any): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function addMonths(dataISO: string, meses: number): string {
  const d = new Date(`${dataISO}T00:00:00Z`);
  const dia = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + meses);
  const diasNoMes = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(dia, diasNoMes));
  return d.toISOString().slice(0, 10);
}

function formatBR(dataISO: string): string {
  const [, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}`;
}

/**
 * Próxima ocorrência do mesmo dia/mês de `dataEvento` a partir de `fromDate`
 * (inclusive). Usada para achar o "aniversário da festa" (item 8). Em anos
 * sem 29/02, cai para 28/02 (edge case raro de festa marcada nessa data).
 */
function nextAnniversary(dataEvento: string, fromDate: string): string {
  const [, mesStr, diaStr] = dataEvento.split("-");
  const mes = Number(mesStr);
  const dia = Number(diaStr);
  const anoBase = Number(fromDate.slice(0, 4));
  const diasNoMes = (ano: number) => new Date(Date.UTC(ano, mes, 0)).getUTCDate();

  for (const ano of [anoBase, anoBase + 1]) {
    const diaAjustado = Math.min(dia, diasNoMes(ano));
    const candidata = `${ano}-${String(mes).padStart(2, "0")}-${String(diaAjustado).padStart(2, "0")}`;
    if (candidata >= fromDate) return candidata;
  }
  // Não deveria chegar aqui (o loop acima sempre cobre ano+1), mas garante retorno.
  return `${anoBase + 1}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export type RetornoLead = {
  id: string;
  nome: string;
  telefone: string;
  retornarEm: string;
};

async function getRetornos(): Promise<{ hoje: RetornoLead[]; atrasados: RetornoLead[] }> {
  const hoje = manausTodayISO();
  const rows = await sql`
    select id, nome, telefone, retornar_em
    from leads
    where retornar_em is not null
      and retornar_em <= ${hoje}
      and status not in ('fechado', 'perdido')
    order by retornar_em asc
  `;

  const hojeList: RetornoLead[] = [];
  const atrasadosList: RetornoLead[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of rows as any[]) {
    const item: RetornoLead = {
      id: row.id,
      nome: row.nome,
      telefone: row.telefone,
      retornarEm: asDateString(row.retornar_em),
    };
    if (item.retornarEm === hoje) hojeList.push(item);
    else atrasadosList.push(item);
  }
  return { hoje: hojeList, atrasados: atrasadosList };
}

export type FestaProxima = {
  id: string;
  nome: string;
  temaSlug: string | null;
  dataEvento: string;
};

async function getFestasProximos7Dias(): Promise<FestaProxima[]> {
  const hoje = manausTodayISO();
  const limite = addDaysISO(hoje, 7);
  const rows = await sql`
    select id, nome, tema_slug, data_evento
    from leads
    where status = 'fechado'
      and data_evento is not null
      and data_evento between ${hoje} and ${limite}
    order by data_evento asc
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map((row) => ({
    id: row.id,
    nome: row.nome,
    temaSlug: row.tema_slug,
    dataEvento: asDateString(row.data_evento),
  }));
}

async function getLeadsNovas24h(): Promise<{ total: number; paradosNoMeio: number }> {
  const rows = await sql`
    select source, current_step
    from leads
    where created_at >= now() - interval '24 hours'
  `;
  const total = rows.length;
  const paradosNoMeio = (rows as { source: string; current_step: string | null }[]).filter(
    (row) =>
      row.source === "quiz" &&
      !(QUIZ_DONE_STEPS as readonly string[]).includes(row.current_step ?? "contato"),
  ).length;
  return { total, paradosNoMeio };
}

/**
 * Temas que "se repetem todo ano" para fins de recompra (item 8): a criança
 * faz aniversário de novo (infantil) e adultos comemoram aniversário todo
 * ano. Ficam de fora, de propósito:
 * - `casamentos` e `formaturas`: eventos únicos por natureza (não tem "casar
 *   nas bodas de 1 ano com o mesmo buffet" como rotina automática a oferecer).
 * - `quinze-anos`: também é único — não faz 15 anos de novo no ano seguinte.
 * - `outro` (corporativo/diverso): natureza ambígua demais para automatizar
 *   sem saber se é anual (ex.: confraternização de empresa) ou pontual.
 */
const TEMAS_RECOMPRA = ["infantil", "aniversarios"] as const;

/** Janela do lembrete de recompra: até 300 dias sem avisar de novo. */
const RECOMPRA_INTERVALO_REAVISO_DIAS = 300;

export type RecompraLead = {
  id: string;
  nome: string;
  telefone: string;
  temaSlug: string;
  dataEventoAnterior: string;
  proximoAniversario: string;
};

/**
 * Festas fechadas de tema recorrente cujo "aniversário" (mesmo dia/mês, ano
 * seguinte) cai nos próximos 2 meses, e que não foram avisadas nos últimos
 * ~300 dias. Exportada para o dashboard usar diretamente (item 8), além de
 * entrar no resumo diário (13).
 */
export async function getRecompras(): Promise<RecompraLead[]> {
  const hoje = manausTodayISO();
  const limite = addMonths(hoje, 2);
  // now() - N dias, calculado em JS e passado como parâmetro (evita montar
  // trecho de SQL com interpolação de string para um intervalo dinâmico).
  const reavisoLimite = new Date(Date.now() - RECOMPRA_INTERVALO_REAVISO_DIAS * 24 * 60 * 60 * 1000).toISOString();

  const rows = await sql.query(
    `select id, nome, telefone, tema_slug, data_evento
     from leads
     where status = 'fechado'
       and tema_slug = any($1)
       and data_evento is not null
       and data_evento < $2
       and (recompra_avisada_em is null or recompra_avisada_em < $3)`,
    [TEMAS_RECOMPRA, hoje, reavisoLimite],
  );

  const out: RecompraLead[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of rows as any[]) {
    const dataEventoAnterior = asDateString(row.data_evento);
    const proximoAniversario = nextAnniversary(dataEventoAnterior, hoje);
    if (proximoAniversario >= hoje && proximoAniversario <= limite) {
      out.push({
        id: row.id,
        nome: row.nome,
        telefone: row.telefone,
        temaSlug: row.tema_slug,
        dataEventoAnterior,
        proximoAniversario,
      });
    }
  }
  return out.sort((a, b) => a.proximoAniversario.localeCompare(b.proximoAniversario));
}

export type PessoaEsperando = {
  id: string;
  nome: string;
  telefone: string;
};

export type DataLiberada = {
  data: string;
  pessoas: PessoaEsperando[];
};

/**
 * Datas na lista de espera (ainda não avisadas) que já não estão mais
 * ocupadas — nem por festa fechada, nem por bloqueio manual (item 9).
 * Exportada para o dashboard usar diretamente.
 */
export async function getDatasLiberadasComEspera(): Promise<DataLiberada[]> {
  const hoje = manausTodayISO();
  const rows = await sql`
    select w.id, w.nome, w.telefone, w.data
    from waitlist w
    where w.avisado_em is null
      and w.data >= ${hoje}
      and not exists (
        select 1 from leads l where l.status = 'fechado' and l.data_evento = w.data
      )
      and not exists (
        select 1 from blocked_dates b where b.data = w.data
      )
    order by w.data asc
  `;

  const grouped = new Map<string, DataLiberada>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of rows as any[]) {
    const data = asDateString(row.data);
    if (!grouped.has(data)) grouped.set(data, { data, pessoas: [] });
    grouped.get(data)!.pessoas.push({ id: row.id, nome: row.nome, telefone: row.telefone });
  }
  return [...grouped.values()];
}

export type DailySummary = { titulo: string; texto: string };

/**
 * Monta o resumo do dia (retornos, festas da semana, leads novos, recompras
 * e datas liberadas) em até 6 linhas. `null` quando não há nada a avisar —
 * a rota do cron não manda notificação nesse caso.
 */
export async function buildDailySummary(): Promise<DailySummary | null> {
  const [
    { hoje: retornosHoje, atrasados: retornosAtrasados },
    festas,
    leadsNovas,
    recompras,
    datasLiberadas,
    pedidosAvaliacao,
  ] = await Promise.all([
    getRetornos(),
    getFestasProximos7Dias(),
    getLeadsNovas24h(),
    getRecompras(),
    getDatasLiberadasComEspera(),
    getPedidosDeAvaliacao(),
  ]);

  const linhas: string[] = [];

  if (retornosHoje.length || retornosAtrasados.length) {
    linhas.push(`Retornos: ${retornosHoje.length} hoje, ${retornosAtrasados.length} atrasado(s).`);
  }

  if (festas.length) {
    const proxima = festas[0];
    linhas.push(
      `Festas nos próximos 7 dias: ${festas.length} (mais próxima ${formatBR(proxima.dataEvento)}, ${proxima.nome}).`,
    );
  }

  if (leadsNovas.total) {
    const paradosTexto = leadsNovas.paradosNoMeio
      ? ` (${leadsNovas.paradosNoMeio} parou/pararam no meio do simulador)`
      : "";
    linhas.push(`Leads novos nas últimas 24h: ${leadsNovas.total}${paradosTexto}.`);
  }

  if (recompras.length) {
    linhas.push(`Festa do ano que vem: ${recompras.length} cliente(s) prontos para o convite de recompra.`);
  }

  if (datasLiberadas.length) {
    const totalEsperando = datasLiberadas.reduce((soma, d) => soma + d.pessoas.length, 0);
    linhas.push(
      `Datas liberadas com espera: ${datasLiberadas.length} data(s), ${totalEsperando} pessoa(s) esperando.`,
    );
  }

  if (pedidosAvaliacao.length) {
    const nomes = pedidosAvaliacao.map((p) => p.nome.trim().split(/\s+/)[0]);
    linhas.push(`Pedir avaliação: ${nomes.join(", ")}.`);
  }

  if (!linhas.length) return null;

  return {
    titulo: "Resumo do dia - Rosa Buffet",
    texto: linhas.join("\n"),
  };
}
