import "server-only";
import { sql } from "@/lib/db/client";
import { manausTodayISO, addDaysISO } from "./manaus-date";

// Lembrete "Pedir avaliação" do dashboard: festas fechadas cuja data já
// passou (entre 2 e 10 dias atrás, em Manaus) e que ainda não tiveram o
// pedido de avaliação/depoimento marcado. Arquivo novo e próprio — não mexe
// em leads.ts (outro agente mexe nele em paralelo), só lê/grava a coluna
// `avaliacao_pedida_em` direto.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asDateString(value: any): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export type PedidoAvaliacao = {
  id: string;
  nome: string;
  telefone: string;
  temaSlug: string | null;
  dataEvento: string;
};

/**
 * Festas fechadas com `data_evento` entre hoje−10 dias e hoje−2 dias
 * (Manaus) que ainda não tiveram `avaliacao_pedida_em` marcado. Mais
 * antigas primeiro (mais urgente pedir).
 */
export async function getPedidosDeAvaliacao(): Promise<PedidoAvaliacao[]> {
  const hoje = manausTodayISO();
  const desde = addDaysISO(hoje, -10);
  const ate = addDaysISO(hoje, -2);

  const rows = await sql`
    select id, nome, telefone, tema_slug, data_evento
    from leads
    where status = 'fechado'
      and data_evento is not null
      and data_evento between ${desde} and ${ate}
      and avaliacao_pedida_em is null
    order by data_evento asc
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map((row) => ({
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    temaSlug: row.tema_slug,
    dataEvento: asDateString(row.data_evento),
  }));
}

/** Marca que já foi pedida a avaliação/depoimento a este lead. */
export async function markAvaliacaoPedida(leadId: string): Promise<void> {
  await sql`
    update leads
    set avaliacao_pedida_em = now(), updated_at = now()
    where id = ${leadId}
  `;
}
