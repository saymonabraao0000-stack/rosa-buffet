import { requireSession } from "@/lib/crm/require-session";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getRelatorioMes } from "@/lib/crm/relatorio";
import { manausTodayISO } from "@/lib/crm/manaus-date";
import { LEAD_ORIGENS, type LeadStatus } from "@/lib/crm/types";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  orcamento_enviado: "Orçamento enviado",
  fechado: "Fechado",
  perdido: "Perdido",
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const MES_LABELS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function mesLabel(mesISO: string, capitalizado = false): string {
  const [ano, mes] = mesISO.split("-").map(Number);
  const nome = MES_LABELS[mes - 1];
  const texto = `${nome} de ${ano}`;
  return capitalizado ? texto[0].toUpperCase() + texto.slice(1) : texto;
}

function mesLabelCurto(mesISO: string): string {
  const [, mes] = mesISO.split("-").map(Number);
  return MES_LABELS[mes - 1].slice(0, 3);
}

function somarMes(mesISO: string, delta: number): string {
  const [ano, mes] = mesISO.split("-").map(Number);
  const dt = new Date(Date.UTC(ano, mes - 1 + delta, 1));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
}

function isMesValido(mes: string | undefined): mes is string {
  return !!mes && /^\d{4}-\d{2}$/.test(mes);
}

type PageProps = {
  searchParams: Promise<{ mes?: string }>;
};

export default async function CrmRelatorioPage({ searchParams }: PageProps) {
  await requireSession();
  const params = await searchParams;
  const mesAtualManaus = manausTodayISO().slice(0, 7);
  const mes = isMesValido(params.mes) ? params.mes : mesAtualManaus;

  const relatorio = await getRelatorioMes(mes);
  const mesAnteriorHref = `/crm/relatorio?mes=${somarMes(mes, -1)}`;
  const mesProximoHref = `/crm/relatorio?mes=${somarMes(mes, 1)}`;

  const leitura = montarLeitura(relatorio, mes);

  const maxOrigem = Math.max(1, ...relatorio.porOrigem.map((o) => o.leads));
  const maxFunil = Math.max(1, ...relatorio.funil.map((f) => f.total));
  const maxFaturamentoMensal = Math.max(1, ...relatorio.faturamentoUltimos6Meses.map((f) => f.total));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-cream">Relatório</h1>
        <div className="flex items-center gap-1 rounded-full border border-cream/10 bg-cream/5 p-1">
          <Link
            href={mesAnteriorHref}
            aria-label="Mês anterior"
            className="focus-gold flex h-8 w-8 items-center justify-center rounded-full text-cream/70 transition-colors hover:text-gold"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <span className="min-w-[9.5rem] px-2 text-center text-sm font-semibold text-cream">
            {mesLabel(mes, true)}
          </span>
          <Link
            href={mesProximoHref}
            aria-label="Próximo mês"
            className="focus-gold flex h-8 w-8 items-center justify-center rounded-full text-cream/70 transition-colors hover:text-gold"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm text-cream">{leitura}</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Leads do mês"
          value={relatorio.leadsNoMes}
          variacaoPct={relatorio.variacaoLeadsPct}
        />
        <StatTile
          label="Conversão"
          value={`${Math.round(taxaConversao(relatorio) * 100)}%`}
        />
        <StatTile
          label="Tempo médio de resposta"
          value={
            relatorio.tempoRespostaMedioHoras !== null
              ? formatHoras(relatorio.tempoRespostaMedioHoras)
              : "—"
          }
        />
        <StatTile label="Faturamento do mês" value={currency.format(relatorio.faturamentoMes)} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Por origem</h2>
          {relatorio.porOrigem.length === 0 ? (
            <p className="rounded-xl border border-cream/10 bg-cream/5 p-4 text-sm text-cream/60">
              Nenhum lead neste mês.
            </p>
          ) : (
            <ul className="flex flex-col gap-3 rounded-xl border border-cream/10 bg-cream/5 p-4">
              {relatorio.porOrigem.map((o) => (
                <li key={o.origem ?? "sem-origem"}>
                  <div className="flex items-center justify-between text-xs text-cream/60">
                    <span>{o.origem ? LEAD_ORIGENS[o.origem] : "Não informado"}</span>
                    <span>
                      {o.leads} lead{o.leads === 1 ? "" : "s"} · {o.fechados} fechado
                      {o.fechados === 1 ? "" : "s"} · {o.conversaoPct}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-cream/10">
                    <div
                      className="h-2 rounded-full bg-gold"
                      style={{ width: `${Math.round((o.leads / maxOrigem) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Funil do mês</h2>
          {relatorio.leadsNoMes === 0 ? (
            <p className="rounded-xl border border-cream/10 bg-cream/5 p-4 text-sm text-cream/60">
              Nenhum lead neste mês.
            </p>
          ) : (
            <ul className="flex flex-col gap-3 rounded-xl border border-cream/10 bg-cream/5 p-4">
              {relatorio.funil.map((f) => (
                <li key={f.status}>
                  <div className="flex items-center justify-between text-xs text-cream/60">
                    <span>{STATUS_LABELS[f.status]}</span>
                    <span>{f.total}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-cream/10">
                    <div
                      className="h-2 rounded-full bg-gold"
                      style={{ width: `${Math.round((f.total / maxFunil) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Resposta e simulador</h2>
          <ul className="flex flex-col gap-2 rounded-xl border border-cream/10 bg-cream/5 p-4 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-cream/60">Tempo médio até o 1º contato</span>
              <span className="text-cream">
                {relatorio.tempoRespostaMedioHoras !== null
                  ? formatHoras(relatorio.tempoRespostaMedioHoras)
                  : "—"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-cream/60">Mediana</span>
              <span className="text-cream">
                {relatorio.tempoRespostaMedianaHoras !== null
                  ? formatHoras(relatorio.tempoRespostaMedianaHoras)
                  : "—"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-cream/60">Respondidos em até 1h</span>
              <span className="text-cream">
                {relatorio.respondidosEm1hPct !== null ? `${relatorio.respondidosEm1hPct}%` : "—"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-cream/60">Simulações que pararam no meio</span>
              <span className="text-cream">{relatorio.quizIncompletos}</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Faturamento dos últimos 6 meses</h2>
          <div className="rounded-xl border border-cream/10 bg-cream/5 p-4">
            <div className="flex items-end justify-between gap-2">
              {relatorio.faturamentoUltimos6Meses.map((f) => (
                <div key={f.mes} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] text-cream/60">
                    {f.total > 0 ? currency.format(f.total).replace("R$", "").trim() : ""}
                  </span>
                  <div className="flex h-24 w-full items-end">
                    <div
                      className={`w-full rounded-t-md ${f.mes === mes ? "bg-gold" : "bg-gold/40"}`}
                      style={{ height: `${Math.max(2, Math.round((f.total / maxFaturamentoMensal) * 100))}%` }}
                    />
                  </div>
                  <span className="text-[10px] uppercase text-cream/60">{mesLabelCurto(f.mes)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Festas do mês</h2>
          <div className="rounded-xl border border-cream/10 bg-cream/5 p-4">
            <span className="block text-xs font-semibold uppercase tracking-wide text-cream/60">
              Festas fechadas com data em {mesLabel(mes)}
            </span>
            <span className="mt-2 block font-display text-3xl text-cream">
              {relatorio.festasRealizadasNoMes}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

function taxaConversao(relatorio: { funil: { status: LeadStatus; total: number }[] }): number {
  const total = relatorio.funil.reduce((a, f) => a + f.total, 0);
  const fechados = relatorio.funil.find((f) => f.status === "fechado")?.total ?? 0;
  return total > 0 ? fechados / total : 0;
}

function formatHoras(horas: number): string {
  if (horas < 1) return `${Math.round(horas * 60)} min`;
  if (horas < 48) return `${horas.toFixed(1).replace(".", ",")} h`;
  return `${Math.round(horas / 24)} dias`;
}

function montarLeitura(
  relatorio: Awaited<ReturnType<typeof getRelatorioMes>>,
  mes: string,
): string {
  if (relatorio.leadsNoMes === 0) {
    return `${mesLabel(mes, true)}: nenhum lead registrado ainda.`;
  }

  const partes: string[] = [];
  const variacao =
    relatorio.variacaoLeadsPct !== null
      ? ` (${relatorio.variacaoLeadsPct >= 0 ? "+" : ""}${relatorio.variacaoLeadsPct}% sobre o mês anterior)`
      : "";
  partes.push(
    `${mesLabel(mes, true)}: ${relatorio.leadsNoMes} lead${relatorio.leadsNoMes === 1 ? "" : "s"}${variacao}`,
  );

  if (relatorio.festasRealizadasNoMes > 0) {
    partes.push(
      `${relatorio.festasRealizadasNoMes} festa${relatorio.festasRealizadasNoMes === 1 ? "" : "s"} fechada${
        relatorio.festasRealizadasNoMes === 1 ? "" : "s"
      }`,
    );
  }

  const melhorOrigem = [...relatorio.porOrigem].sort((a, b) => b.leads - a.leads)[0];
  if (melhorOrigem && melhorOrigem.leads > 0) {
    const nome = melhorOrigem.origem ? LEAD_ORIGENS[melhorOrigem.origem] : "Não informado";
    partes.push(`${nome} trouxe mais leads`);
  }

  return `${partes[0]}. ${partes.slice(1).join(". ")}${partes.length > 1 ? "." : ""}`;
}

function StatTile({
  label,
  value,
  variacaoPct,
}: {
  label: string;
  value: string | number;
  variacaoPct?: number | null;
}) {
  return (
    <div className="rounded-xl border border-cream/10 bg-cream/5 p-4">
      <span className="block text-xs font-semibold uppercase tracking-wide text-cream/60">
        {label}
      </span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-3xl text-cream">{value}</span>
        {variacaoPct !== undefined && variacaoPct !== null && (
          <span
            className={`text-xs font-semibold ${variacaoPct >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {variacaoPct >= 0 ? "↑" : "↓"} {Math.abs(variacaoPct)}%
          </span>
        )}
      </div>
    </div>
  );
}
