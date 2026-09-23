import "server-only";
import { sql } from "@/lib/db/client";
import type {
  DashboardStats,
  Lead,
  LeadDetailsInput,
  LeadFilters,
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
  };
}

export async function createLead(input: { nome: string; telefone: string }): Promise<{ id: string }> {
  const rows = await sql`
    insert into leads (nome, telefone, source)
    values (${input.nome}, ${input.telefone}, 'quiz')
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
    insert into leads (nome, telefone, source, status, tema_slug, guest_range_slug, data_evento, buffet_tier_slug)
    values (
      ${input.nome}, ${input.telefone}, 'manual', ${input.status},
      ${input.temaSlug}, ${input.guestRangeSlug}, ${input.dataEvento}, ${input.buffetTierSlug}
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
        buffet_tier_slug = ${input.buffetTierSlug}, updated_at = now()
    where id = ${id}
  `;
}

/** Apaga o lead; as anotações vão junto (on delete cascade em lead_notes). */
export async function deleteLead(id: string): Promise<void> {
  await sql`delete from leads where id = ${id}`;
}

/** Datas de eventos fechados — usado pelo calendário do quiz pra saber o que já está reservado. */
export async function getBookedDates(): Promise<string[]> {
  const rows = await sql`
    select data_evento from leads
    where status = 'fechado' and data_evento is not null
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map((r) => asDateString(r.data_evento)!).filter(Boolean);
}

/** Mesma consulta que getBookedDates, mas com os dados completos para a agenda do CRM. */
export async function getConfirmedEvents(): Promise<Lead[]> {
  const rows = await sql`
    select * from leads
    where status = 'fechado' and data_evento is not null
    order by data_evento asc
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map(mapLeadRow);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totaisRows, mesRows, proximosRows] = await Promise.all([
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
  };
}
