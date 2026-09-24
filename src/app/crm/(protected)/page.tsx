import { requireSession } from "@/lib/crm/require-session";
import Link from "next/link";
import { getDashboardStats } from "@/lib/crm/leads";
import { getDatasLiberadasComEspera, getRecompras } from "@/lib/crm/daily";
import { getThemeLabel } from "@/lib/quiz-data";
import { toWhatsappNumber } from "@/lib/crm/whatsapp";
import { LEAD_ORIGENS } from "@/lib/crm/types";
import { CHECKLIST_TOTAL_ITENS } from "@/lib/crm/checklist";
import RecompraOfertaButton from "@/components/crm/RecompraOfertaButton";
import AvisarEsperaButton from "@/components/crm/AvisarEsperaButton";
import { hasAnyPushSubscription } from "@/lib/webpush";

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

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default async function CrmDashboardPage() {
  await requireSession();
  const [stats, recompras, datasLiberadas, temAvisoAtivo] = await Promise.all([
    getDashboardStats(),
    getRecompras(),
    getDatasLiberadasComEspera(),
    hasAnyPushSubscription(),
  ]);
  const totalLeads = Object.values(stats.porStatus).reduce((a, b) => a + b, 0);
  const porOrigemOrdenado = [...stats.porOrigem].sort((a, b) => b.total - a.total);
  const maxOrigemTotal = Math.max(1, ...porOrigemOrdenado.map((o) => o.total));

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Dashboard</h1>

      {!temAvisoAtivo && (
        <Link
          href="/crm/configuracoes"
          className="focus-gold mt-4 block rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-cream/80 transition-colors hover:border-gold/50"
        >
          Ative os avisos no celular em <span className="text-gold">Configurações</span> para não perder um lead novo.
        </Link>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Leads este mês" value={stats.leadsEsteMes} />
        <StatTile label="Total de leads" value={totalLeads} />
        <StatTile
          label="Taxa de conversão"
          value={`${Math.round(stats.taxaConversao * 100)}%`}
        />
        <StatTile label="Aguardando contato" value={stats.porStatus.novo} />
        <StatTile label="Faturamento do mês" value={currency.format(stats.faturamentoMes)} />
        <StatTile label="A receber" value={currency.format(stats.aReceber)} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {recompras.length > 0 && (
          <section className="lg:col-span-2">
            <h2 className="mb-4 font-display text-xl text-cream">Oferecer a festa do ano que vem</h2>
            <ul className="flex flex-col gap-3">
              {recompras.map((r) => {
                const primeiroNome = r.nome.trim().split(/\s+/)[0];
                const temaLabel = getThemeLabel(r.temaSlug) ?? "festa";
                const texto =
                  `Olá, ${primeiroNome}! Aqui é da Rosa Buffet 🌹 Já está chegando de novo a data da sua festa ` +
                  `de ${temaLabel}! Vamos organizar a comemoração desse ano com a gente?`;
                const url = `https://wa.me/${toWhatsappNumber(r.telefone)}?text=${encodeURIComponent(texto)}`;
                return (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cream/10 bg-cream/5 p-4"
                  >
                    <div>
                      <Link
                        href={`/crm/leads/${r.id}`}
                        className="focus-gold font-semibold text-cream transition-colors hover:text-gold"
                      >
                        {r.nome}
                      </Link>
                      <p className="text-sm text-cream/60">
                        {temaLabel} · festa anterior em {dateFormatter.format(parseISODate(r.dataEventoAnterior))} ·
                        aniversário em {dateFormatter.format(parseISODate(r.proximoAniversario))}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-gold rounded-full bg-gold px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-gold-soft"
                      >
                        WhatsApp
                      </a>
                      <RecompraOfertaButton id={r.id} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {datasLiberadas.length > 0 && (
          <section className="lg:col-span-2">
            <h2 className="mb-4 font-display text-xl text-cream">Data liberada — pessoas esperando</h2>
            <ul className="flex flex-col gap-3">
              {datasLiberadas.map((d) => (
                <li key={d.data} className="rounded-xl border border-cream/10 bg-cream/5 p-4">
                  <p className="mb-2 text-sm font-semibold text-cream">
                    {dateFormatter.format(parseISODate(d.data))} ficou livre
                  </p>
                  <ul className="flex flex-col gap-2">
                    {d.pessoas.map((p) => {
                      const primeiroNome = p.nome.trim().split(/\s+/)[0];
                      const texto =
                        `Olá, ${primeiroNome}! Aqui é da Rosa Buffet 🌹 Boa notícia: a data que você estava ` +
                        "aguardando ficou disponível! Quer fechar com a gente?";
                      const url = `https://wa.me/${toWhatsappNumber(p.telefone)}?text=${encodeURIComponent(texto)}`;
                      return (
                        <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <span className="text-cream">{p.nome}</span>
                          <div className="flex shrink-0 items-center gap-2">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="focus-gold rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-gold-soft"
                            >
                              WhatsApp
                            </a>
                            <AvisarEsperaButton id={p.id} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Retornos de hoje</h2>
          {stats.retornosHoje.length === 0 ? (
            <p className="text-sm text-cream/60">Nenhum retorno marcado para hoje.</p>
          ) : (
            <ul className="flex flex-col gap-2 rounded-xl border border-cream/10 bg-cream/5 p-4">
              {stats.retornosHoje.map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/crm/leads/${item.id}`}
                    className="focus-gold text-cream transition-colors hover:text-gold"
                  >
                    {item.nome}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Atrasados</h2>
          {stats.retornosAtrasados.length === 0 ? (
            <p className="text-sm text-cream/60">Nenhum retorno atrasado.</p>
          ) : (
            <ul className="flex flex-col gap-2 rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
              {stats.retornosAtrasados.map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/crm/leads/${item.id}`}
                    className="focus-gold text-cream transition-colors hover:text-gold"
                  >
                    {item.nome}
                  </Link>
                  <span className="text-amber-300/80">
                    desde {dateFormatter.format(parseISODate(item.retornarEm))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

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

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">De onde vêm os leads</h2>
          <ul className="flex flex-col gap-3 rounded-xl border border-cream/10 bg-cream/5 p-4">
            {porOrigemOrdenado.map((o) => (
              <li key={o.origem ?? "sem-origem"}>
                <div className="flex items-center justify-between text-xs text-cream/60">
                  <span>{o.origem ? LEAD_ORIGENS[o.origem] : "Não informado"}</span>
                  <span>
                    {o.total} · {o.fechados} fechado{o.fechados === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-cream/10">
                  <div
                    className="h-2 rounded-full bg-gold"
                    style={{ width: `${Math.round((o.total / maxOrigemTotal) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
            {porOrigemOrdenado.length === 0 && (
              <li className="text-sm text-cream/60">Nenhum lead ainda.</li>
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl text-cream">Próximas festas (30 dias)</h2>
          {stats.proximasFestas.length === 0 ? (
            <p className="text-sm text-cream/60">Nenhuma festa fechada nos próximos 30 dias.</p>
          ) : (
            <ul className="flex flex-col gap-2 rounded-xl border border-cream/10 bg-cream/5 p-4">
              {stats.proximasFestas.map((festa) => (
                <li key={festa.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/crm/leads/${festa.id}`}
                    className="focus-gold text-cream transition-colors hover:text-gold"
                  >
                    {festa.nome}
                  </Link>
                  <span className="text-cream/60">
                    {dateFormatter.format(parseISODate(festa.dataEvento))} ·{" "}
                    {festa.checklistProntos}/{CHECKLIST_TOTAL_ITENS}
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
