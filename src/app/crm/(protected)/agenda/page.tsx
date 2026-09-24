import { requireSession } from "@/lib/crm/require-session";
import Link from "next/link";
import { getAgendaMonthData, getConfirmedEvents } from "@/lib/crm/leads";
import { manausTodayISO } from "@/lib/crm/manaus-date";
import { quizThemes } from "@/lib/quiz-data";
import AgendaCalendar from "@/components/crm/AgendaCalendar";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function isMesValido(mes: string | undefined): mes is string {
  return !!mes && /^\d{4}-\d{2}$/.test(mes);
}

export default async function CrmAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  await requireSession();
  const { mes } = await searchParams;
  const todayISO = manausTodayISO();
  const mesISO = isMesValido(mes) ? mes : todayISO.slice(0, 7);

  const [agenda, eventos] = await Promise.all([
    getAgendaMonthData(mesISO),
    getConfirmedEvents(),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Agenda</h1>
      <p className="mt-2 text-sm text-cream/60">
        Festas fechadas (dourado), datas bloqueadas (cinza) e lista de espera de cada dia. As
        datas dourada e cinza aparecem como indisponíveis no calendário do simulador (/orcamento).
      </p>

      <AgendaCalendar key={mesISO} mesISO={mesISO} todayISO={todayISO} agenda={agenda} />

      <h2 className="mt-10 mb-4 font-display text-xl text-cream">Próximas festas</h2>
      <ul className="flex flex-col gap-3">
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
