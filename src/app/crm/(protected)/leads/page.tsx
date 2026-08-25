import Link from "next/link";
import { listLeads } from "@/lib/crm/leads";
import type { LeadFilters, LeadStatus } from "@/lib/crm/types";
import { quizThemes } from "@/lib/quiz-data";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  orcamento_enviado: "Orçamento enviado",
  fechado: "Fechado",
  perdido: "Perdido",
};

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

type SearchParams = {
  status?: string;
  tema?: string;
  from?: string;
  to?: string;
  q?: string;
};

export default async function CrmLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters: LeadFilters = {
    status: (params.status as LeadStatus) || undefined,
    temaSlug: params.tema || undefined,
    dateFrom: params.from || undefined,
    dateTo: params.to || undefined,
    q: params.q || undefined,
  };
  const leadsList = await listLeads(filters);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Leads</h1>

      <form method="GET" className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-ink/10 bg-white/50 p-4">
        <Field label="Buscar">
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Nome ou telefone"
            className="focus-gold rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          />
        </Field>
        <Field label="Status">
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="focus-gold rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tema">
          <select
            name="tema"
            defaultValue={params.tema ?? ""}
            className="focus-gold rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          >
            <option value="">Todos</option>
            {quizThemes.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="De">
          <input
            type="date"
            name="from"
            defaultValue={params.from}
            className="focus-gold rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          />
        </Field>
        <Field label="Até">
          <input
            type="date"
            name="to"
            defaultValue={params.to}
            className="focus-gold rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          />
        </Field>
        <button
          type="submit"
          className="focus-gold rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
        >
          Filtrar
        </button>
        {(params.q || params.status || params.tema || params.from || params.to) && (
          <Link href="/crm/leads" className="focus-gold text-sm font-medium text-gray-dark hover:text-ink">
            Limpar
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-ink/5 text-xs font-semibold uppercase tracking-wide text-gray-dark">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Tema</th>
              <th className="px-4 py-3">Data desejada</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Criado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {leadsList.map((lead) => {
              const tema = quizThemes.find((t) => t.slug === lead.temaSlug);
              return (
                <tr key={lead.id} className="transition-colors hover:bg-gold-soft/10">
                  <td className="px-4 py-3">
                    <Link
                      href={`/crm/leads/${lead.id}`}
                      className="focus-gold font-medium text-ink hover:text-gold"
                    >
                      {lead.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-dark">{lead.telefone}</td>
                  <td className="px-4 py-3 text-gray-dark">{tema?.label ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-dark">
                    {lead.dataEvento
                      ? dateTimeFormatter.format(new Date(`${lead.dataEvento}T00:00:00`))
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-dark">
                    {dateTimeFormatter.format(new Date(lead.createdAt))}
                  </td>
                </tr>
              );
            })}
            {leadsList.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-dark">
                  Nenhum lead encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-gray-dark">
      {label}
      {children}
    </label>
  );
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  novo: "bg-blue-100 text-blue-700",
  contatado: "bg-amber-100 text-amber-700",
  orcamento_enviado: "bg-purple-100 text-purple-700",
  fechado: "bg-green-100 text-green-700",
  perdido: "bg-gray-200 text-gray-600",
};

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
