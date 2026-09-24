"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, GripVertical } from "lucide-react";
import { updateLeadStatusAction } from "@/lib/crm/actions";
import type { LeadStatus } from "@/lib/crm/types";
import { quizThemes } from "@/lib/quiz-data";
import type { FunilLead } from "@/lib/crm/funil";
import { manausTodayISO } from "@/lib/crm/manaus-date";

const COLUMNS: { status: LeadStatus; label: string }[] = [
  { status: "novo", label: "Novo" },
  { status: "contatado", label: "Contatado" },
  { status: "orcamento_enviado", label: "Orçamento enviado" },
  { status: "fechado", label: "Fechado" },
  { status: "perdido", label: "Perdido" },
];

const MOVE_TARGETS: { status: LeadStatus; label: string }[] = COLUMNS;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function diasAtras(iso: string): number {
  const criado = new Date(iso);
  const hoje = new Date();
  const ms = hoje.getTime() - criado.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function temaLabel(slug: string | null): string | null {
  if (!slug) return null;
  return quizThemes.find((t) => t.slug === slug)?.label ?? slug;
}

export default function FunilBoard({
  leads: leadsIniciais,
  perdidosTotal,
}: {
  leads: FunilLead[];
  perdidosTotal: number;
}) {
  const [leads, setLeads] = useState(leadsIniciais);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [motivoPromptId, setMotivoPromptId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hoje = manausTodayISO();

  const porStatus = useMemo(() => {
    const map: Record<LeadStatus, FunilLead[]> = {
      novo: [],
      contatado: [],
      orcamento_enviado: [],
      fechado: [],
      perdido: [],
    };
    for (const lead of leads) map[lead.status].push(lead);
    return map;
  }, [leads]);

  function moverLead(id: string, novoStatus: LeadStatus, motivo?: string) {
    const anterior = leads;
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.status === novoStatus) return;

    setErro(null);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: novoStatus } : l)));

    startTransition(async () => {
      try {
        await updateLeadStatusAction(id, novoStatus, motivo);
      } catch {
        setLeads(anterior);
        setErro(`Não deu para mover "${lead.nome}" para ${COLUMNS.find((c) => c.status === novoStatus)?.label}. Tenta de novo.`);
      }
    });
  }

  function pedirMovimento(id: string, novoStatus: LeadStatus) {
    if (novoStatus === "perdido") {
      setMotivoPromptId(id);
      return;
    }
    moverLead(id, novoStatus);
  }

  const valorTotalFechado = porStatus.fechado.reduce((soma, l) => soma + (l.valorFechado ?? 0), 0);
  const leadArrastando = dragId ? leads.find((l) => l.id === dragId) : null;

  return (
    <div>
      {erro && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {erro}
        </div>
      )}

      {/* Celular/tablet: rolagem horizontal com snap, ~85% da largura por coluna.
          Preferi isso a abas porque dá pra ver o começo da coluna vizinha (sinaliza
          que dá pra arrastar/rolar) sem esconder a contagem das outras colunas. */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:snap-none md:grid-cols-5 md:overflow-visible md:px-0">
        {COLUMNS.map((col) => {
          const lista = porStatus[col.status];
          const total = col.status === "perdido" ? perdidosTotal : lista.length;
          return (
            <div
              key={col.status}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStatus(col.status);
              }}
              onDragLeave={() => setDragOverStatus((s) => (s === col.status ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverStatus(null);
                const id = e.dataTransfer.getData("text/plain") || dragId;
                if (id) pedirMovimento(id, col.status);
                setDragId(null);
              }}
              className={`flex w-[85%] shrink-0 snap-start flex-col rounded-xl border bg-cream/5 md:w-auto ${
                dragOverStatus === col.status ? "border-gold" : "border-cream/10"
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-cream/10 px-3 py-3">
                <h2 className="font-display text-sm text-cream">{col.label}</h2>
                <span className="rounded-full bg-cream/10 px-2 py-0.5 text-xs font-semibold text-cream/70">
                  {total}
                </span>
              </div>
              {col.status === "fechado" && (
                <p className="border-b border-cream/10 px-3 py-2 text-xs text-gold">
                  {currencyFormatter.format(valorTotalFechado)}
                </p>
              )}
              {col.status === "perdido" && perdidosTotal > lista.length && (
                <p className="border-b border-cream/10 px-3 py-2 text-[11px] text-cream/40">
                  Mostrando os últimos 30 dias ({lista.length} de {total})
                </p>
              )}

              <ul className="flex min-h-[80px] flex-1 flex-col gap-2 p-2">
                {lista.map((lead) => {
                  const atrasado = lead.retornarEm != null && lead.retornarEm <= hoje;
                  return (
                    <li
                      key={lead.id}
                      draggable
                      onDragStart={(e) => {
                        setDragId(lead.id);
                        e.dataTransfer.setData("text/plain", lead.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setDragOverStatus(null);
                      }}
                      className={`group rounded-lg border border-cream/10 bg-ink px-3 py-2.5 text-sm ${
                        leadArrastando?.id === lead.id ? "opacity-40" : ""
                      } hidden md:block`}
                    >
                      <CartaoConteudo lead={lead} atrasado={atrasado} />
                    </li>
                  );
                })}
                {lista.map((lead) => {
                  const atrasado = lead.retornarEm != null && lead.retornarEm <= hoje;
                  return (
                    <li
                      key={`${lead.id}-mobile`}
                      className="rounded-lg border border-cream/10 bg-ink px-3 py-2.5 text-sm md:hidden"
                    >
                      <CartaoConteudo lead={lead} atrasado={atrasado} />
                      <MoverParaMobile
                        statusAtual={lead.status}
                        disabled={isPending}
                        onMover={(status) => pedirMovimento(lead.id, status)}
                      />
                    </li>
                  );
                })}
                {lista.length === 0 && (
                  <li className="rounded-lg border border-dashed border-cream/10 px-3 py-6 text-center text-xs text-cream/40">
                    Nenhum lead aqui.
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {motivoPromptId && (
        <MotivoPerdidoModal
          onCancelar={() => setMotivoPromptId(null)}
          onConfirmar={(motivo) => {
            moverLead(motivoPromptId, "perdido", motivo);
            setMotivoPromptId(null);
          }}
        />
      )}
    </div>
  );
}

function CartaoConteudo({ lead, atrasado }: { lead: FunilLead; atrasado: boolean }) {
  const tema = temaLabel(lead.temaSlug);
  return (
    <Link href={`/crm/leads/${lead.id}`} className="focus-gold block">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-cream">{lead.nome}</span>
        <GripVertical className="hidden h-4 w-4 shrink-0 text-cream/20 md:group-hover:block" aria-hidden="true" />
      </div>
      <p className="mt-1 text-xs text-cream/50">
        {[
          tema,
          lead.dataEvento ? `festa ${dateFormatter.format(new Date(`${lead.dataEvento}T00:00:00`))}` : null,
          `criado há ${diasAtras(lead.createdAt)} dia(s)`,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {atrasado && (
        <span className="mt-1.5 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
          Retorno atrasado
        </span>
      )}
    </Link>
  );
}

function MoverParaMobile({
  statusAtual,
  disabled,
  onMover,
}: {
  statusAtual: LeadStatus;
  disabled: boolean;
  onMover: (status: LeadStatus) => void;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setAberto((v) => !v)}
        className="focus-gold rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream disabled:opacity-60"
      >
        Mover para…
      </button>
      {aberto && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {MOVE_TARGETS.filter((t) => t.status !== statusAtual).map((t) => (
            <button
              key={t.status}
              type="button"
              onClick={() => {
                onMover(t.status);
                setAberto(false);
              }}
              className="focus-gold rounded-full border border-cream/15 px-3 py-1.5 text-xs text-cream/80 hover:border-gold hover:text-gold"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MotivoPerdidoModal({
  onCancelar,
  onConfirmar,
}: {
  onCancelar: () => void;
  onConfirmar: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center">
      <div className="w-full max-w-sm rounded-xl border border-cream/10 bg-ink p-5">
        <h3 className="font-display text-lg text-cream">Motivo da perda</h3>
        <p className="mt-1 text-xs text-cream/50">Opcional — ajuda a entender por que o lead não fechou.</p>
        <textarea
          autoFocus
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex.: achou caro, fechou com outro buffet…"
          rows={3}
          className="focus-gold mt-3 w-full rounded-lg border border-cream/15 bg-cream/5 px-3 py-2 text-sm text-cream placeholder:text-cream/30 outline-none focus:border-gold"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            className="focus-gold rounded-full px-4 py-2 text-sm font-medium text-cream/60 hover:text-cream"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmar(motivo)}
            className="focus-gold rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-soft"
          >
            Mover para Perdido
          </button>
        </div>
      </div>
    </div>
  );
}
