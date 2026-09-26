import { requireSession } from "@/lib/crm/require-session";
import Link from "next/link";
import { findDuplicatesForLeadIds, listLeads } from "@/lib/crm/leads";
import type { LeadFilters, LeadStatus } from "@/lib/crm/types";
import { quizThemes } from "@/lib/quiz-data";
import { isQuizIncomplete, quizStepLabel } from "@/lib/crm/quiz-progress";
import { manausTodayISO } from "@/lib/crm/manaus-date";

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
  retorno?: string;
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
    retorno: (params.retorno as "hoje" | "atrasados") || undefined,
  };
  const leadsList = await listLeads(filters);
  const duplicateMap = await findDuplicatesForLeadIds(leadsList.map((l) => l.id));
  const todayISO = manausTodayISO();

  // Item 18 — o link de exportação leva os mesmos filtros aplicados na tela.
  const exportParams = new URLSearchParams();
  if (params.q) exportParams.set("q", params.q);
  if (params.status) exportParams.set("status", params.status);
  if (params.tema) exportParams.set("tema", params.tema);
  if (params.from) exportParams.set("from", params.from);
  if (params.to) exportParams.set("to", params.to);
  if (params.incompleto) exportParams.set("incompleto", params.incompleto);
  if (params.retorno) exportParams.set("retorno", params.retorno);
  const exportQuery = exportParams.toString();
  const exportHref = `/crm/leads/exportar.csv${exportQuery ? `?${exportQuery}` : ""}`;

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Leads</h1>

      <form method="GET" className="mt-6 grid grid-cols-2 items-end gap-3 rounded-xl border border-cream/10 bg-cream/5 p-4 md:flex md:flex-wrap">
        <Field label="Buscar" wide>
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
        <Field label="Retorno">
          <select
            name="retorno"
            defaultValue={params.retorno ?? ""}
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm text-cream outline-none focus:border-gold"
          >
            <option value="">Todos</option>
            <option value="hoje">Hoje</option>
            <option value="atrasados">Atrasados</option>
          </select>
        </Field>
        <Field label="De">
          <input
            type="date"
            name="from"
            defaultValue={params.from}
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm text-cream block min-w-0 appearance-none outline-none focus:border-gold [color-scheme:dark] [&::-webkit-date-and-time-value]:text-left"
          />
        </Field>
        <Field label="Até">
          <input
            type="date"
            name="to"
            defaultValue={params.to}
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm text-cream block min-w-0 appearance-none outline-none focus:border-gold [color-scheme:dark] [&::-webkit-date-and-time-value]:text-left"
          />
        </Field>
        <div className="col-span-2 flex items-center gap-3 md:contents">
          <button
            type="submit"
            className="focus-gold h-10 flex-1 rounded-full bg-gold px-5 text-sm md:flex-none font-semibold text-ink transition-colors hover:bg-gold-soft"
          >
            Filtrar
          </button>
          {(params.q || params.status || params.tema || params.from || params.to || params.incompleto || params.retorno) && (
            <Link href="/crm/leads" className="focus-gold whitespace-nowrap text-sm font-medium text-cream/60 hover:text-cream">
              Limpar
            </Link>
          )}
          <a
            href={exportHref}
            className="focus-gold inline-flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-full border border-cream/15 px-4 text-sm font-semibold text-cream md:flex-none transition-colors hover:border-gold hover:text-gold"
          >
            Exportar planilha
          </a>
        </div>
      </form>

      {/* Celular: cartões. Tabela a partir de md. */}
      <ul className="mt-6 flex flex-col gap-3 md:hidden">
        {leadsList.map((lead) => {
          const tema = quizThemes.find((t) => t.slug === lead.temaSlug);
          return (
            <li key={lead.id}>
              <Link
                href={`/crm/leads/${lead.id}`}
                className="focus-gold block rounded-xl border border-cream/10 bg-cream/5 p-4 active:bg-cream/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium text-cream">{lead.nome}</span>
                  <StatusBadge status={lead.status} />
                </div>
                {isQuizIncomplete(lead) && (
                  <span className="mt-1 block text-xs text-amber-300/80">{quizStepLabel(lead)}</span>
                )}
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <RetornoBadge retornarEm={lead.retornarEm} todayISO={todayISO} />
                  {duplicateMap.has(lead.id) && <DuplicadoBadge />}
                </div>
                <p className="mt-2 text-sm text-cream/60">{lead.telefone}</p>
                <p className="mt-1 text-xs text-cream/50">
                  {[
                    tema?.label,
                    lead.dataEvento
                      ? `festa ${dateTimeFormatter.format(new Date(`${lead.dataEvento}T00:00:00`))}`
                      : undefined,
                    `criado ${dateTimeFormatter.format(new Date(lead.createdAt))}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </Link>
            </li>
          );
        })}
        {leadsList.length === 0 && (
          <li className="rounded-xl border border-cream/10 p-6 text-center text-sm text-cream/60">
            Nenhum lead encontrado.
          </li>
        )}
      </ul>

      <div className="mt-6 hidden overflow-x-auto rounded-xl border border-cream/10 md:block">
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
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <RetornoBadge retornarEm={lead.retornarEm} todayISO={todayISO} />
                      {duplicateMap.has(lead.id) && <DuplicadoBadge />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cream/60">{lead.telefone}</td>
                  <td className="px-4 py-3 text-cream/60">{tema?.label ?? "-"}</td>
                  <td className="px-4 py-3 text-cream/60">
                    {lead.dataEvento
                      ? dateTimeFormatter.format(new Date(`${lead.dataEvento}T00:00:00`))
                      : "-"}
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

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label
      className={`flex min-w-0 flex-col gap-1 text-xs font-medium text-cream/60 [&>*]:h-10 [&>*]:w-full md:[&>*]:w-auto ${wide ? "col-span-2" : ""}`}
    >
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

// Item 1 — indicação de retorno hoje/atrasado no cartão e na linha da lista.
function RetornoBadge({ retornarEm, todayISO }: { retornarEm: string | null; todayISO: string }) {
  if (!retornarEm) return null;
  if (retornarEm < todayISO) {
    return (
      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
        Retorno atrasado
      </span>
    );
  }
  if (retornarEm === todayISO) {
    return (
      <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] font-semibold text-blue-300">
        Retorna hoje
      </span>
    );
  }
  return (
    <span className="rounded-full bg-cream/10 px-2 py-0.5 text-[11px] font-semibold text-cream/60">
      Retorna {dateTimeFormatter.format(new Date(`${retornarEm}T00:00:00`))}
    </span>
  );
}

// Item 19 — etiqueta discreta de possível duplicado (o link com o nome fica na ficha).
function DuplicadoBadge() {
  return (
    <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[11px] font-semibold text-purple-300">
      Possível duplicado
    </span>
  );
}
