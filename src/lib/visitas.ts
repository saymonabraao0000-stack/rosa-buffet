import "server-only";
import { sql } from "@/lib/db/client";
import { getSetting, DEFAULT_VISITAS_CONFIG, type VisitasConfig } from "@/lib/crm/settings";
import { manausTodayISO, addDaysISO } from "@/lib/crm/manaus-date";
import { LEAD_ORIGENS } from "@/lib/crm/types";

/**
 * Agendamento de visitas ao salão (/visita no site, integrado ao CRM). Regras
 * de horário livre, criação (com lead novo ou vinculado) e ações de status.
 */

export type VisitaStatus = "agendada" | "confirmada" | "realizada" | "cancelada" | "nao_compareceu";

export type Visita = {
  id: string;
  leadId: string | null;
  nome: string;
  telefone: string;
  data: string; // "AAAA-MM-DD"
  hora: string; // "HH:MM"
  status: VisitaStatus;
  observacao: string | null;
  origem: string | null;
  createdAt: string;
  updatedAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Visita {
  return {
    id: row.id,
    leadId: row.lead_id,
    nome: row.nome,
    telefone: row.telefone,
    data: row.data instanceof Date ? row.data.toISOString().slice(0, 10) : String(row.data),
    hora: row.hora,
    status: row.status,
    observacao: row.observacao,
    origem: row.origem,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

export async function getVisitasConfig(): Promise<VisitasConfig> {
  return getSetting<VisitasConfig>("visitas_config", DEFAULT_VISITAS_CONFIG);
}

const ATIVOS: VisitaStatus[] = ["agendada", "confirmada"];

/** Gera os horários "HH:MM" possíveis num dia, dado início/fim/duração. */
function slotsOfDay(config: VisitasConfig): string[] {
  const [hi, mi] = config.horaInicio.split(":").map(Number);
  const [hf, mf] = config.horaFim.split(":").map(Number);
  const startMin = hi * 60 + mi;
  const endMin = hf * 60 + mf;
  const slots: string[] = [];
  for (let m = startMin; m + config.duracaoMinutos <= endMin; m += config.duracaoMinutos) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }
  return slots;
}

function weekdayOfISO(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** "agora" em minutos desde a meia-noite de Manaus de hoje, mais a antecedência mínima, como um instante "AAAA-MM-DD HH:MM" comparável em string. */
function nowManausMinutePrecision(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Manaus",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

function addHoursToDateTime(dateTime: string, hours: number): string {
  const [datePart, timePart] = dateTime.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, min] = timePart.split(":").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, h, min));
  dt.setUTCMinutes(dt.getUTCMinutes() + hours * 60);
  const iso = dt.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
}

export type DiaComHorarios = { data: string; horarios: string[] };

/**
 * Horários livres para os próximos `config.diasFrente` dias (ou até `limiteDias`,
 * se menor), respeitando dias da semana, antecedência mínima, agendamentos
 * ativos e dias ocupados (festa fechada/bloqueio) quando configurado.
 */
export async function getFreeSlotsForRange(limiteDias?: number): Promise<DiaComHorarios[]> {
  const config = await getVisitasConfig();
  const hoje = manausTodayISO();
  const diasFrente = Math.min(config.diasFrente, limiteDias ?? config.diasFrente);
  const limiteData = addDaysISO(hoje, diasFrente);

  const [ocupacaoRows, bloqueioRows, visitasRows] = await Promise.all([
    config.excluirDiasOcupados
      ? sql`select data_evento as data from leads where status = 'fechado' and data_evento between ${hoje} and ${limiteData}`
      : Promise.resolve([]),
    config.excluirDiasOcupados
      ? sql`select data from blocked_dates where data between ${hoje} and ${limiteData}`
      : Promise.resolve([]),
    sql`
      select data, hora from visitas
      where data between ${hoje} and ${limiteData} and status = any(${ATIVOS})
    `,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diasOcupados = new Set<string>([...(ocupacaoRows as any[]), ...(bloqueioRows as any[])].map((r) =>
    r.data instanceof Date ? r.data.toISOString().slice(0, 10) : String(r.data),
  ));

  const ocupadosPorDia = new Map<string, Set<string>>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of visitasRows as any[]) {
    const data = row.data instanceof Date ? row.data.toISOString().slice(0, 10) : String(row.data);
    if (!ocupadosPorDia.has(data)) ocupadosPorDia.set(data, new Set());
    ocupadosPorDia.get(data)!.add(row.hora);
  }

  const minDateTime = addHoursToDateTime(nowManausMinutePrecision(), config.antecedenciaMinimaHoras);
  const baseSlots = slotsOfDay(config);

  const dias: DiaComHorarios[] = [];
  for (let i = 0; i <= diasFrente; i++) {
    const data = addDaysISO(hoje, i);
    if (!config.diasSemana.includes(weekdayOfISO(data))) continue;
    if (config.excluirDiasOcupados && diasOcupados.has(data)) continue;

    const ocupadosNoDia = ocupadosPorDia.get(data) ?? new Set<string>();
    const horarios = baseSlots.filter((hora) => {
      if (ocupadosNoDia.has(hora)) return false;
      const dateTime = `${data} ${hora}`;
      return dateTime >= minDateTime;
    });
    if (horarios.length > 0) dias.push({ data, horarios });
  }

  return dias;
}

export async function getFreeSlotsForDate(data: string): Promise<string[]> {
  const dias = await getFreeSlotsForRange();
  return dias.find((d) => d.data === data)?.horarios ?? [];
}

/** Busca lead existente pelo telefone (últimos 11 dígitos, criado nos últimos 90 dias) ou cria um novo. */
async function findOrCreateLeadByPhone(input: {
  nome: string;
  telefone: string;
  origemRaw: string | undefined;
}): Promise<string> {
  const existing = await sql`
    select id from leads
    where right(regexp_replace(telefone, '\D', '', 'g'), 11) = right(regexp_replace(${input.telefone}, '\D', '', 'g'), 11)
      and created_at >= now() - interval '90 days'
    order by created_at desc
    limit 1
  `;
  if (existing[0]?.id) return existing[0].id as string;

  const origem = input.origemRaw && input.origemRaw in LEAD_ORIGENS ? input.origemRaw : "site";
  const rows = await sql`
    insert into leads (nome, telefone, source, status, current_step, origem)
    values (${input.nome}, ${input.telefone}, 'quiz', 'novo', null, ${origem})
    returning id
  `;
  return rows[0].id as string;
}

export type CreateVisitaResult =
  | { ok: true; visita: Visita }
  | { ok: false; erro: "horario_ocupado" | "invalido" };

export async function createVisita(input: {
  nome: string;
  telefone: string;
  data: string;
  hora: string;
  origem?: string;
}): Promise<CreateVisitaResult> {
  const nome = input.nome.trim();
  const digits = input.telefone.replace(/\D/g, "").length;
  if (nome.length < 2 || nome.length > 80 || digits < 10 || digits > 13) {
    return { ok: false, erro: "invalido" };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.data) || !/^\d{2}:\d{2}$/.test(input.hora)) {
    return { ok: false, erro: "invalido" };
  }

  const leadId = await findOrCreateLeadByPhone({
    nome,
    telefone: input.telefone,
    origemRaw: input.origem,
  });

  try {
    const rows = await sql`
      insert into visitas (lead_id, nome, telefone, data, hora, origem)
      values (${leadId}, ${nome}, ${input.telefone}, ${input.data}, ${input.hora}, ${input.origem ?? null})
      returning *
    `;
    return { ok: true, visita: mapRow(rows[0]) };
  } catch (err) {
    // Índice único parcial (data, hora) recusa a corrida entre dois
    // agendamentos simultâneos no mesmo horário.
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("visitas_data_hora_ativa_idx") || message.includes("duplicate key")) {
      return { ok: false, erro: "horario_ocupado" };
    }
    throw err;
  }
}

export async function getVisitaById(id: string): Promise<Visita | null> {
  const rows = await sql`select * from visitas where id = ${id}`;
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function listVisitasByLead(leadId: string): Promise<Visita[]> {
  const rows = await sql`select * from visitas where lead_id = ${leadId} order by data desc, hora desc`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map(mapRow);
}

export async function listUpcomingVisitas(): Promise<Visita[]> {
  const hoje = manausTodayISO();
  const rows = await sql`
    select * from visitas
    where data >= ${hoje} and status = any(${ATIVOS})
    order by data asc, hora asc
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map(mapRow);
}

export async function listVisitasForMonth(mesISO: string): Promise<Visita[]> {
  const [ano, mes] = mesISO.split("-").map(Number);
  const inicio = `${mesISO}-01`;
  const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const fim = `${mesISO}-${String(ultimoDia).padStart(2, "0")}`;
  const rows = await sql`
    select * from visitas where data between ${inicio} and ${fim} order by data asc, hora asc
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map(mapRow);
}

export async function updateVisitaStatus(id: string, status: VisitaStatus): Promise<void> {
  await sql`update visitas set status = ${status}, updated_at = now() where id = ${id}`;
}

/** Agendamento manual pelo CRM (ficha do lead) — não passa pelo anti-spam, mas respeita o mesmo índice único. */
export async function createVisitaManual(input: {
  leadId: string;
  nome: string;
  telefone: string;
  data: string;
  hora: string;
  observacao?: string;
}): Promise<CreateVisitaResult> {
  try {
    const rows = await sql`
      insert into visitas (lead_id, nome, telefone, data, hora, origem, observacao)
      values (${input.leadId}, ${input.nome}, ${input.telefone}, ${input.data}, ${input.hora}, 'crm', ${input.observacao ?? null})
      returning *
    `;
    return { ok: true, visita: mapRow(rows[0]) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("visitas_data_hora_ativa_idx") || message.includes("duplicate key")) {
      return { ok: false, erro: "horario_ocupado" };
    }
    throw err;
  }
}
