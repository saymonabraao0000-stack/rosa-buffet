import "server-only";
import { sql } from "@/lib/db/client";
import type { LeadStatus } from "./types";

// Consulta própria do funil (item 16) — não usa `mapLeadRow`/`leads.ts` de
// propósito, para não depender de um arquivo em edição por outro agente ao
// mesmo tempo. Traz só as colunas que o cartão do kanban precisa.
export type FunilLead = {
  id: string;
  nome: string;
  telefone: string;
  status: LeadStatus;
  temaSlug: string | null;
  dataEvento: string | null; // "AAAA-MM-DD"
  createdAt: string;
  retornarEm: string | null; // "AAAA-MM-DD"
  valorFechado: number | null;
  source: string;
  currentStep: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): FunilLead {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    status: row.status,
    temaSlug: row.tema_slug,
    dataEvento: row.data_evento instanceof Date ? row.data_evento.toISOString().slice(0, 10) : row.data_evento,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    retornarEm: row.retornar_em instanceof Date ? row.retornar_em.toISOString().slice(0, 10) : row.retornar_em,
    valorFechado: row.valor_fechado,
    source: row.source,
    currentStep: row.current_step,
  };
}

/**
 * Leads para o funil em colunas. "Perdido" só traz os últimos 30 dias (por
 * `updated_at`, que é tocado toda vez que o status muda) — a contagem total
 * de perdidos (sem o corte de 30 dias) vem à parte em `countPerdidosTotal`.
 */
export async function listFunilLeads(): Promise<FunilLead[]> {
  const rows = await sql`
    select id, nome, telefone, status, tema_slug, data_evento, created_at,
           retornar_em, valor_fechado, source, current_step
    from leads
    where status != 'perdido' or updated_at >= now() - interval '30 days'
    order by created_at desc
  `;
  return (rows as unknown[]).map(mapRow);
}

export async function countPerdidosTotal(): Promise<number> {
  const rows = (await sql`select count(*)::int as total from leads where status = 'perdido'`) as {
    total: number;
  }[];
  return rows[0]?.total ?? 0;
}
