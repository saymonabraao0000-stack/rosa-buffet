import "server-only";
import { sql } from "@/lib/db/client";
import { manausTodayISO } from "@/lib/crm/manaus-date";

// Tela inicial do CRM (grade de aplicativos): os contadores dos ícones e a
// lista "Pra hoje". Tudo em uma ida ao banco.

export type InicioItem =
  | { tipo: "festa"; id: string; nome: string; temaSlug: string | null }
  | { tipo: "visita"; id: string; nome: string; hora: string }
  | { tipo: "retorno"; id: string; nome: string };

export type InicioResumo = {
  leadsNovos: number;
  visitasHoje: number;
  depoimentosParaAprovar: number;
  retornosAtrasados: number;
  hoje: InicioItem[];
};

export async function getInicioResumo(): Promise<InicioResumo> {
  const hoje = manausTodayISO();
  const [contagens, festas, visitas, retornos] = await Promise.all([
    sql`
      select
        (select count(*) from leads where status = 'novo')::int as leads_novos,
        (select count(*) from testimonials where status = 'pendente' and respondido_em is not null)::int as depoimentos,
        (select count(*) from leads
          where retornar_em < ${hoje} and status not in ('fechado', 'perdido'))::int as atrasados
    `,
    sql`select id, nome, tema_slug from leads where status = 'fechado' and data_evento = ${hoje} order by nome`,
    sql`
      select id, nome, hora from visitas
      where data = ${hoje} and status in ('agendada', 'confirmada')
      order by hora
    `,
    sql`
      select id, nome from leads
      where retornar_em = ${hoje} and status not in ('fechado', 'perdido')
      order by nome
    `,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = contagens[0] as any;
  return {
    leadsNovos: c.leads_novos,
    visitasHoje: visitas.length,
    depoimentosParaAprovar: c.depoimentos,
    retornosAtrasados: c.atrasados,
    hoje: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(festas as any[]).map((r) => ({ tipo: "festa" as const, id: r.id, nome: r.nome, temaSlug: r.tema_slug })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(visitas as any[]).map((r) => ({ tipo: "visita" as const, id: r.id, nome: r.nome, hora: String(r.hora).slice(0, 5) })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(retornos as any[]).map((r) => ({ tipo: "retorno" as const, id: r.id, nome: r.nome })),
    ],
  };
}
