import { requireSession } from "@/lib/crm/require-session";
import Link from "next/link";
import { getDashboardStats } from "@/lib/crm/leads";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  novo: "Novo",
  contatado: "Contatado",
  orcamento_enviado: "Orçamento enviado",
  fechado: "Fechado",
  perdido: "Perdido",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default async function CrmDashboardPage() {
  await requireSession();
  const stats = await getDashboardStats();
  const totalLeads = Object.values(stats.porStatus).reduce((a, b) => a + b, 0);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Dashboard</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Leads este mês" value={stats.leadsEsteMes} />
        <StatTile label="Total de leads" value={totalLeads} />
        <StatTile
          label="Taxa de conversão"
          value={`${Math.round(stats.taxaConversao * 100)}%`}
        />
        <StatTile label="Aguardando contato" value={stats.porStatus.novo} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Leads por status</h2>
          <ul className="flex flex-col gap-2 rounded-xl border border-cream/10 bg-cream/5 p-4">
            {Object.entries(stats.porStatus).map(([status, count]) => (
              <li key={status} className="flex items-center justify-between text-sm">
                <span className="text-cream/60">{STATUS_LABELS[status] ?? status}</span>
                <span className="font-semibold text-cream">{count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Próximos eventos fechados</h2>
          {stats.proximosEventos.length === 0 ? (
            <p className="text-sm text-cream/60">Nenhum evento confirmado por enquanto.</p>
          ) : (
            <ul className="flex flex-col gap-2 rounded-xl border border-cream/10 bg-cream/5 p-4">
              {stats.proximosEventos.map((evento) => (
                <li key={evento.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/crm/leads/${evento.id}`}
                    className="focus-gold text-cream transition-colors hover:text-gold"
                  >
                    {evento.nome}
                  </Link>
                  <span className="text-cream/60">
                    {dateFormatter.format(parseISODate(evento.dataEvento))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-cream/10 bg-cream/5 p-4">
      <span className="block text-xs font-semibold uppercase tracking-wide text-cream/60">
        {label}
      </span>
      <span className="mt-2 block font-display text-3xl text-cream">{value}</span>
    </div>
  );
}
