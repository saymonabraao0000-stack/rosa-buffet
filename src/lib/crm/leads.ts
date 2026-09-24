import "server-only";
import { sql } from "@/lib/db/client";
import { QUIZ_DONE_STEPS } from "./quiz-progress";
import { LEAD_ORIGENS } from "./types";
import { addDaysISO, manausTodayISO } from "./manaus-date";
import { checklistProntos } from "./checklist";
import type {
  DashboardStats,
  Lead,
  LeadChecklist,
  LeadDetailsInput,
  LeadFilters,
  LeadFinanceiroInput,
  LeadProgressPatch,
  LeadStatus,
  ManualLeadInput,
} from "./types";

// A conexão HTTP do @neondatabase/serverless devolve colunas `date`/timestamptz
// já como string; esta função só protege contra o driver devolver um Date em
// algum caso (ex.: se o cliente mudar no futuro).
function asDateString(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function asISOString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function asISOStringOrNull(value: unknown): string | null {
  if (value == null) return null;
  return asISOString(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLeadRow(row: any): Lead {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    source: row.source,
    status: row.status,
    perdidoMotivo: row.perdido_motivo,
    temaSlug: row.tema_slug,
    guestRangeSlug: row.guest_range_slug,
    estimatedGuests: row.estimated_guests,
    dataEvento: asDateString(row.data_evento),
    dataSkipped: row.data_skipped,
    buffetTierSlug: row.buffet_tier_slug,
    addonSlugs: row.addon_slugs ?? [],
    estimateMin: row.estimate_min,
    estimateMax: row.estimate_max,
    currentStep: row.current_step,
    sinalPago: row.sinal_pago,
    createdAt: asISOString(row.created_at),
    updatedAt: asISOString(row.updated_at),
    retornarEm: asDateString(row.retornar_em),
    origem: row.origem,
    valorFechado: row.valor_fechado,
    valorSinal: row.valor_sinal,
    valorPago: row.valor_pago ?? 0,
    pagamentoFinalEm: asDateString(row.pagamento_final_em),
    checklist: row.checklist ?? {},
    recompraAvisadaEm: asISOStringOrNull(row.recompra_avisada_em),
    googleEventId: row.google_event_id,
  };
}

// Leads criados pelo quiz do site (/orcamento) sempre nascem com origem
// "site" — quem preenche a ficha manual/edita escolhe a origem real.
export async function createLead(input: {
  nome: string;
  telefone: string;
  origem?: string;
}): Promise<{ id: string }> {
  // Só aceita origens conhecidas (vem de ?origem= na URL do simulador);
  // qualquer outra coisa vira "site".
  const origem = input.origem && input.origem in LEAD_ORIGENS ? input.origem : "site";
  const rows = await sql`
    insert into leads (nome, telefone, source, current_step, origem)
    values (${input.nome}, ${input.telefone}, 'quiz', 'contato', ${origem})
    returning id
  `;
  return { id: rows[0].id };
}

export async function updateLeadProgress(id: string, patch: LeadProgressPatch): Promise<void> {
  // Monta um UPDATE dinâmico só com os campos presentes no patch — o quiz
  // manda um campo por vez a cada etapa respondida.
  const columns: Record<string, unknown> = {
    tema_slug: patch.temaSlug,
    guest_range_slug: patch.guestRangeSlug,
    estimated_guests: patch.estimatedGuests,
    data_evento: patch.dataEvento,
    data_skipped: patch.dataSkipped,
    buffet_tier_slug: patch.buffetTierSlug,
    addon_slugs: patch.addonSlugs,
    estimate_min: patch.estimateMin,
    estimate_max: patch.estimateMax,
    current_step: patch.currentStep,
  };

  const entries = Object.entries(columns).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return;

  const setClauses = entries.map(([col], i) => `${col} = $${i + 2}`);
  const params = entries.map(([, value]) => value);

  await sql.query(
    `update leads set ${setClauses.join(", ")}, updated_at = now() where id = $1`,
    [id, ...params],
  );
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const rows = await sql`select * from leads where id = ${id}`;
  return rows[0] ? mapLeadRow(rows[0]) : null;
}

export async function listLeads(filters: LeadFilters): Promise<Lead[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }
  if (filters.temaSlug) {
    params.push(filters.temaSlug);
    conditions.push(`tema_slug = $${params.length}`);
  }
  if (filters.dateFrom) {
    params.push(filters.dateFrom);
    conditions.push(`created_at >= $${params.length}`);
  }
  if (filters.dateTo) {
    params.push(filters.dateTo);
    conditions.push(`created_at <= $${params.length}`);
  }
  if (filters.q) {
    params.push(`%${filters.q}%`);
    conditions.push(`(nome ilike $${params.length} or telefone ilike $${params.length})`);
  }

  if (filters.incompleto) {
    params.push(QUIZ_DONE_STEPS);
    conditions.push(`source = 'quiz' and coalesce(current_step, 'contato') <> all($${params.length})`);
  }

  if (filters.retorno === "hoje") {
    params.push(manausTodayISO());
    conditions.push(`retornar_em = $${params.length}`);
  } else if (filters.retorno === "atrasados") {
    params.push(manausTodayISO());
    conditions.push(`retornar_em is not null and retornar_em < $${params.length}`);
  }

  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
  const rows = await sql.query(
    `select * from leads ${where} order by created_at desc limit 200`,
    params,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map(mapLeadRow);
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  perdidoMotivo: string | null,
): Promise<void> {
  await sql`
    update leads
    set status = ${status}, perdido_motivo = ${perdidoMotivo}, updated_at = now()
    where id = ${id}
  `;
}

export async function markSinalPago(id: string, paid: boolean): Promise<void> {
  await sql`update leads set sinal_pago = ${paid}, updated_at = now() where id = ${id}`;
}

export async function createManualLead(input: ManualLeadInput): Promise<{ id: string }> {
  const rows = await sql`
    insert into leads (nome, telefone, source, status, tema_slug, guest_range_slug, data_evento, buffet_tier_slug, origem)
    values (
      ${input.nome}, ${input.telefone}, 'manual', ${input.status},
      ${input.temaSlug}, ${input.guestRangeSlug}, ${input.dataEvento}, ${input.buffetTierSlug}, ${input.origem}
    )
    returning id
  `;
  return { id: rows[0].id };
}

export async function updateLeadDetails(id: string, input: LeadDetailsInput): Promise<void> {
  await sql`
    update leads
    set nome = ${input.nome}, telefone = ${input.telefone}, tema_slug = ${input.temaSlug},
        guest_range_slug = ${input.guestRangeSlug}, data_evento = ${input.dataEvento},
        buffet_tier_slug = ${input.buffetTierSlug}, origem = ${input.origem}, updated_at = now()
    where id = ${id}
  `;
}

/** Item 1 — lembrete de retorno. `retornarEm` nulo limpa o lembrete. */
export async function updateLeadRetornarEm(id: string, retornarEm: string | null): Promise<void> {
  await sql`update leads set retornar_em = ${retornarEm}, updated_at = now() where id = ${id}`;
}

/** Item 4 — financeiro da festa. */
export async function updateLeadFinanceiro(id: string, input: LeadFinanceiroInput): Promise<void> {
  await sql`
    update leads
    set valor_fechado = ${input.valorFechado}, valor_sinal = ${input.valorSinal},
        valor_pago = ${input.valorPago}, pagamento_final_em = ${input.pagamentoFinalEm},
        updated_at = now()
    where id = ${id}
  `;
}

/** Item 15 — checklist da festa (jsonb). */
export async function updateLeadChecklist(id: string, checklist: LeadChecklist): Promise<void> {
  await sql`
    update leads
    set checklist = ${JSON.stringify(checklist)}::jsonb, updated_at = now()
    where id = ${id}
  `;
}

/**
 * Item 19 — lead duplicado: para cada id em `ids`, procura outro lead com os
 * mesmos últimos 11 dígitos do telefone, criado até 90 dias antes ou depois.
 * Uma consulta só (join lateral) em vez de N+1 — usada tanto na ficha (um id)
 * quanto na lista (todos os ids da página).
 */
export async function findDuplicatesForLeadIds(
  ids: string[],
): Promise<Map<string, { id: string; nome: string }>> {
  if (ids.length === 0) return new Map();

  const rows = await sql.query(
    `
    select l.id as lead_id, dup.id as dup_id, dup.nome as dup_nome
    from leads l
    join lateral (
      select l2.id, l2.nome
      from leads l2
      where l2.id <> l.id
        and right(regexp_replace(l2.telefone, '\\D', '', 'g'), 11)
          = right(regexp_replace(l.telefone, '\\D', '', 'g'), 11)
        and abs(extract(epoch from (l.created_at - l2.created_at))) <= 90 * 24 * 3600
      order by l2.created_at desc
      limit 1
    ) dup on true
    where l.id = any($1::uuid[])
    `,
    [ids],
  );

  const map = new Map<string, { id: string; nome: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of rows as any[]) {
    map.set(row.lead_id, { id: row.dup_id, nome: row.dup_nome });
  }
  return map;
}

/** Apaga o lead; as anotações vão junto (on delete cascade em lead_notes). */
export async function deleteLead(id: string): Promise<void> {
  await sql`delete from leads where id = ${id}`;
}

/**
 * Datas indisponíveis — usado pelo calendário do quiz pra saber o que já
 * está reservado. Item 5: passa a ser festas fechadas ∪ datas bloqueadas
 * manualmente (blocked_dates). O simulador não muda de código, só recebe a
 * lista maior.
 */
export async function getBookedDates(): Promise<string[]> {
  const rows = await sql`
    select data_evento as data from leads
    where status = 'fechado' and data_evento is not null
    union
    select data from blocked_dates
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map((r) => asDateString(r.data)!).filter(Boolean);
}

/** Mesma consulta de festas fechadas que getBookedDates, mas com os dados completos para a agenda do CRM. */
export async function getConfirmedEvents(): Promise<Lead[]> {
  const rows = await sql`
    select * from leads
    where status = 'fechado' and data_evento is not null
    order by data_evento asc
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map(mapLeadRow);
}

// ============================================================================
// Item 5 (Agenda em calendário) e item 9 (lista de espera) — Fase 3a do plano
// de melhorias (Planos/crm-melhorias-2026-09-24.md).
// ============================================================================

export type AgendaFestaDia = { data: string; id: string; nome: string };
export type AgendaBloqueioDia = { data: string; motivo: string | null };
export type AgendaEsperaDia = { data: string; id: string; nome: string; telefone: string };

export type AgendaMonthData = {
  festas: AgendaFestaDia[];
  bloqueios: AgendaBloqueioDia[];
  espera: AgendaEsperaDia[];
};

/**
 * Tudo que o calendário mensal da Agenda precisa (festas fechadas, datas
 * bloqueadas e lista de espera) num intervalo de um mês só — evita 1 consulta
 * por dia. `mesISO` no formato "AAAA-MM".
 */
export async function getAgendaMonthData(mesISO: string): Promise<AgendaMonthData> {
  const [ano, mes] = mesISO.split("-").map(Number);
  const inicio = `${mesISO}-01`;
  const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const fim = `${mesISO}-${String(ultimoDia).padStart(2, "0")}`;

  const [festasRows, bloqueiosRows, esperaRows] = await Promise.all([
    sql`
      select id, nome, data_evento from leads
      where status = 'fechado' and data_evento between ${inicio} and ${fim}
      order by data_evento asc
    `,
    sql`select data, motivo from blocked_dates where data between ${inicio} and ${fim}`,
    sql`select id, nome, telefone, data from waitlist where data between ${inicio} and ${fim} order by created_at asc`,
  ]);

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    festas: (festasRows as any[]).map((r) => ({
      data: asDateString(r.data_evento)!,
      id: r.id,
      nome: r.nome,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bloqueios: (bloqueiosRows as any[]).map((r) => ({
      data: asDateString(r.data)!,
      motivo: r.motivo,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    espera: (esperaRows as any[]).map((r) => ({
      data: asDateString(r.data)!,
      id: r.id,
      nome: r.nome,
      telefone: r.telefone,
    })),
  };
}

/** Uma data está ocupada se tem festa fechada nela (excluindo o próprio lead) ou está bloqueada. */
export async function isDataOcupada(data: string, excludeLeadId?: string): Promise<boolean> {
  const rows = await sql.query(
    `
    select 1 from leads
      where status = 'fechado' and data_evento = $1
        and ($2::uuid is null or id <> $2::uuid)
    union
    select 1 from blocked_dates where data = $1
    limit 1
    `,
    [data, excludeLeadId ?? null],
  );
  return rows.length > 0;
}

export async function blockDate(data: string, motivo: string | null): Promise<void> {
  await sql`
    insert into blocked_dates (data, motivo)
    values (${data}, ${motivo})
    on conflict (data) do update set motivo = excluded.motivo
  `;
}

export async function unblockDate(data: string): Promise<void> {
  await sql`delete from blocked_dates where data = ${data}`;
}

/** Entrada de espera de um lead específico para uma data (para saber se já está na lista, na ficha). */
export async function getWaitlistEntryForLead(
  leadId: string,
  data: string,
): Promise<{ id: string } | null> {
  const rows = await sql`
    select id from waitlist where lead_id = ${leadId} and data = ${data} limit 1
  `;
  return rows[0] ? { id: rows[0].id } : null;
}

/** Põe um lead na lista de espera de uma data — não duplica o mesmo lead+data. */
export async function addToWaitlist(input: {
  leadId: string;
  nome: string;
  telefone: string;
  data: string;
}): Promise<{ id: string }> {
  const existing = await getWaitlistEntryForLead(input.leadId, input.data);
  if (existing) return existing;

  const rows = await sql`
    insert into waitlist (lead_id, nome, telefone, data)
    values (${input.leadId}, ${input.nome}, ${input.telefone}, ${input.data})
    returning id
  `;
  return { id: rows[0].id };
}

export async function removeFromWaitlist(id: string): Promise<void> {
  await sql`delete from waitlist where id = ${id}`;
}

/** Marca que a pessoa já foi avisada de que a data liberou (dashboard, item 9). */
export async function markWaitlistAvisado(id: string): Promise<void> {
  await sql`update waitlist set avisado_em = now() where id = ${id}`;
}

/** Marca que já foi oferecida a "festa do ano que vem" a este lead (dashboard, item 8). */
export async function markRecompraAvisada(id: string): Promise<void> {
  await sql`update leads set recompra_avisada_em = now(), updated_at = now() where id = ${id}`;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const todayISO = manausTodayISO();
  const mesAtual = todayISO.slice(0, 7); // "AAAA-MM"
  const em30Dias = addDaysISO(todayISO, 30);

  const [
    totaisRows,
    mesRows,
    proximosRows,
    retornosHojeRows,
    retornosAtrasadosRows,
    origemRows,
    faturamentoRows,
    aReceberRows,
    proximasFestasRows,
  ] = await Promise.all([
    sql`select status, count(*)::int as total from leads group by status`,
    sql`
      select count(*)::int as total from leads
      where created_at >= date_trunc('month', now())
    `,
    sql`
      select id, nome, data_evento from leads
      where status = 'fechado' and data_evento is not null and data_evento >= current_date
      order by data_evento asc
      limit 10
    `,
    sql`
      select id, nome, retornar_em from leads
      where retornar_em = ${todayISO}
      order by nome asc
    `,
    sql`
      select id, nome, retornar_em from leads
      where retornar_em is not null and retornar_em < ${todayISO}
      order by retornar_em asc
    `,
    sql`
      select origem, count(*)::int as total,
        count(*) filter (where status = 'fechado')::int as fechados
      from leads
      group by origem
    `,
    sql`
      select coalesce(sum(valor_fechado), 0)::int as total from leads
      where status = 'fechado' and data_evento is not null
        and to_char(data_evento, 'YYYY-MM') = ${mesAtual}
    `,
    sql`
      select coalesce(sum(valor_fechado - coalesce(valor_pago, 0)), 0)::int as total from leads
      where status = 'fechado' and valor_fechado is not null
        and data_evento is not null and data_evento >= ${todayISO}
    `,
    sql`
      select id, nome, data_evento, checklist from leads
      where status = 'fechado' and data_evento is not null
        and data_evento >= ${todayISO} and data_evento <= ${em30Dias}
      order by data_evento asc
    `,
  ]);

  const porStatus: DashboardStats["porStatus"] = {
    novo: 0,
    contatado: 0,
    orcamento_enviado: 0,
    fechado: 0,
    perdido: 0,
  };
  let totalGeral = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of totaisRows as any[]) {
    porStatus[row.status as LeadStatus] = row.total;
    totalGeral += row.total;
  }

  return {
    leadsEsteMes: mesRows[0]?.total ?? 0,
    porStatus,
    taxaConversao: totalGeral > 0 ? porStatus.fechado / totalGeral : 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proximosEventos: (proximosRows as any[]).map((r) => ({
      id: r.id,
      nome: r.nome,
      dataEvento: asDateString(r.data_evento)!,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retornosHoje: (retornosHojeRows as any[]).map((r) => ({
      id: r.id,
      nome: r.nome,
      retornarEm: asDateString(r.retornar_em)!,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retornosAtrasados: (retornosAtrasadosRows as any[]).map((r) => ({
      id: r.id,
      nome: r.nome,
      retornarEm: asDateString(r.retornar_em)!,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    porOrigem: (origemRows as any[]).map((r) => ({
      origem: r.origem,
      total: r.total,
      fechados: r.fechados,
    })),
    faturamentoMes: faturamentoRows[0]?.total ?? 0,
    aReceber: aReceberRows[0]?.total ?? 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proximasFestas: (proximasFestasRows as any[]).map((r) => ({
      id: r.id,
      nome: r.nome,
      dataEvento: asDateString(r.data_evento)!,
      checklistProntos: checklistProntos(r.checklist ?? {}),
    })),
  };
}
