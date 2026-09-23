import { requireSession } from "@/lib/crm/require-session";
import Link from "next/link";
import { listLeads } from "@/lib/crm/leads";
import type { LeadFilters, LeadStatus } from "@/lib/crm/types";
import { quizThemes } from "@/lib/quiz-data";
import { isQuizIncomplete, quizStepLabel } from "@/lib/crm/quiz-progress";

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
  incompleto?: string;
};

export default async function CrmLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireSession();
  const params = await searchParams;
  const filters: LeadFilters = {
    status: (params.status as LeadStatus) || undefined,
    temaSlug: params.tema || undefined,
    dateFrom: params.from || undefined,
    dateTo: params.to || undefined,
    q: params.q || undefined,
    incompleto: params.incompleto === "1" || undefined,
  };
  const leadsList = await listLeads(filters);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Leads</h1>

      <form method="GET" className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-cream/10 bg-cream/5 p-4">
        <Field label="Buscar">
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Nome ou telefone"
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm text-cream placeholder:text-cream/30 outline-none focus:border-gold"
          />
        </Field>
        <Field label="Status">
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm text-cream outline-none focus:border-gold"
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
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm text-cream outline-none focus:border-gold"
          >
            <option value="">Todos</option>
            {quizThemes.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Simulação">
          <select
            name="incompleto"
            defaultValue={params.incompleto ?? ""}
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm text-cream outline-none focus:border-gold"
          >
            <option value="">Todas</option>
            <option value="1">Parou no meio</option>
          </select>
        </Field>
        <Field label="De">
          <input
            type="date"
            name="from"
            defaultValue={params.from}
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm text-cream outline-none focus:border-gold [color-scheme:dark]"
          />
        </Field>
        <Field label="Até">
          <input
            type="date"
            name="to"
            defaultValue={params.to}
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm text-cream outline-none focus:border-gold [color-scheme:dark]"
          />
        </Field>
        <button
          type="submit"
          className="focus-gold rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
        >
          Filtrar
        </button>
        {(params.q || params.status || params.tema || params.from || params.to || params.incompleto) && (
          <Link href="/crm/leads" className="focus-gold text-sm font-medium text-cream/60 hover:text-cream">
            Limpar
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-cream/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-cream/5 text-xs font-semibold uppercase tracking-wide text-cream/60">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Tema</th>
              <th className="px-4 py-3">Data desejada</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Criado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream/10">
            {leadsList.map((lead) => {
              const tema = quizThemes.find((t) => t.slug === lead.temaSlug);
              return (
                <tr key={lead.id} className="transition-colors hover:bg-cream/5">
                  <td className="px-4 py-3">
                    <Link
                      href={`/crm/leads/${lead.id}`}
                      className="focus-gold font-medium text-cream hover:text-gold"
                    >
                      {lead.nome}
                    </Link>
                    {isQuizIncomplete(lead) && (
                      <span className="mt-1 block text-xs text-amber-300/80">{quizStepLabel(lead)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-cream/60">{lead.telefone}</td>
                  <td className="px-4 py-3 text-cream/60">{tema?.label ?? "—"}</td>
                  <td className="px-4 py-3 text-cream/60">
                    {lead.dataEvento
                      ? dateTimeFormatter.format(new Date(`${lead.dataEvento}T00:00:00`))
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-cream/60">
                    {dateTimeFormatter.format(new Date(lead.createdAt))}
                  </td>
                </tr>
              );
            })}
            {leadsList.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-cream/60">
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
    <label className="flex flex-col gap-1 text-xs font-medium text-cream/60">
      {label}
      {children}
    </label>
  );
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  novo: "bg-blue-500/15 text-blue-300",
  contatado: "bg-amber-500/15 text-amber-300",
  orcamento_enviado: "bg-purple-500/15 text-purple-300",
  fechado: "bg-green-500/15 text-green-300",
  perdido: "bg-cream/10 text-cream/50",
};

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
