import Link from "next/link";
import { requireSession } from "@/lib/crm/require-session";
import { listUpcomingVisitas } from "@/lib/visitas";
import { manausTodayISO, addDaysISO } from "@/lib/crm/manaus-date";
import VisitaActions, { VisitaStatusBadge } from "@/components/crm/VisitaActions";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

export default async function CrmVisitasPage() {
  await requireSession();
  const visitas = await listUpcomingVisitas();
  const todayISO = manausTodayISO();
  const amanhaISO = addDaysISO(todayISO, 1);

  const grupos: { titulo: string; itens: typeof visitas }[] = [
    { titulo: "Hoje", itens: visitas.filter((v) => v.data === todayISO) },
    { titulo: "Amanhã", itens: visitas.filter((v) => v.data === amanhaISO) },
    { titulo: "Próximos dias", itens: visitas.filter((v) => v.data > amanhaISO) },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Visitas ao salão</h1>
      <p className="mt-2 text-sm text-cream/60">
        Agendamentos feitos pelo site (/visita) e manualmente pela ficha do lead.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {grupos.map((grupo) => (
          <section key={grupo.titulo}>
            <h2 className="mb-3 font-display text-lg text-cream">
              {grupo.titulo} {grupo.itens.length > 0 && `(${grupo.itens.length})`}
            </h2>
            {grupo.itens.length === 0 ? (
              <p className="text-sm text-cream/50">Nenhuma visita.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {grupo.itens.map((v) => (
                  <li
                    key={v.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cream/10 bg-cream/5 p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {v.leadId ? (
                          <Link
                            href={`/crm/leads/${v.leadId}`}
                            className="focus-gold font-semibold text-cream hover:text-gold"
                          >
                            {v.nome}
                          </Link>
                        ) : (
                          <span className="font-semibold text-cream">{v.nome}</span>
                        )}
                        <VisitaStatusBadge status={v.status} />
                      </div>
                      <p className="text-sm text-cream/60">
                        {dateFormatter.format(new Date(`${v.data}T12:00:00`))} às {v.hora}
                      </p>
                    </div>
                    <VisitaActions
                      visitaId={v.id}
                      status={v.status}
                      leadId={v.leadId}
                      nome={v.nome}
                      telefone={v.telefone}
                      data={v.data}
                      hora={v.hora}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
