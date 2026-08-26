import Link from "next/link";
import { getConfirmedEvents } from "@/lib/crm/leads";
import { quizThemes } from "@/lib/quiz-data";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default async function CrmAgendaPage() {
  const eventos = await getConfirmedEvents();

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Agenda</h1>
      <p className="mt-2 text-sm text-cream/60">
        Datas de eventos com status &quot;Fechado&quot; — são elas que aparecem como indisponíveis
        no calendário do simulador (/orcamento).
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {eventos.map((lead) => {
          const tema = quizThemes.find((t) => t.slug === lead.temaSlug);
          return (
            <li
              key={lead.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cream/10 bg-cream/5 p-4"
            >
              <div>
                <Link
                  href={`/crm/leads/${lead.id}`}
                  className="focus-gold font-semibold text-cream hover:text-gold"
                >
                  {lead.nome}
                </Link>
                <p className="text-sm text-cream/60">
                  {tema?.label ?? "Tema não informado"}
                  {lead.sinalPago ? " · sinal pago" : " · sinal pendente"}
                </p>
              </div>
              <span className="text-sm font-medium text-cream">
                {lead.dataEvento && dateFormatter.format(new Date(`${lead.dataEvento}T00:00:00`))}
              </span>
            </li>
          );
        })}
        {eventos.length === 0 && (
          <li className="rounded-xl border border-cream/10 bg-cream/5 p-6 text-center text-sm text-cream/60">
            Nenhum evento fechado ainda.
          </li>
        )}
      </ul>
    </div>
  );
}
