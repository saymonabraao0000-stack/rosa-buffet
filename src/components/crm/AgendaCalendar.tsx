"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import {
  blockDateAction,
  removeFromWaitlistAction,
  unblockDateAction,
} from "@/lib/crm/agenda-actions";
import { toWhatsappNumber } from "@/lib/crm/whatsapp";
import { maskPhone } from "@/lib/crm/phone-mask";
import type { AgendaMonthData } from "@/lib/crm/leads";

// Item 5 — calendário mensal da Agenda: navegação por mês (links, mantém a
// página server-driven), seleção de dia (estado local) e painel do dia
// (festas, bloqueio, lista de espera). No celular o calendário mostra só
// número + pontinhos; o painel do dia fica abaixo. No PC, ao lado.

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function addMonthsToMes(mesISO: string, delta: number): string {
  const [y, m] = mesISO.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatDiaMes(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

const dateFormatterCompleto = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default function AgendaCalendar({
  mesISO,
  todayISO,
  agenda,
}: {
  mesISO: string;
  todayISO: string;
  agenda: AgendaMonthData;
}) {
  const [selected, setSelected] = useState<string | null>(
    todayISO.slice(0, 7) === mesISO ? todayISO : null,
  );
  const [isPending, startTransition] = useTransition();
  const [motivo, setMotivo] = useState("");

  const festasByDate = new Map<string, { id: string; nome: string }[]>();
  for (const f of agenda.festas) {
    if (!festasByDate.has(f.data)) festasByDate.set(f.data, []);
    festasByDate.get(f.data)!.push({ id: f.id, nome: f.nome });
  }
  const bloqueioByDate = new Map<string, string | null>();
  for (const b of agenda.bloqueios) bloqueioByDate.set(b.data, b.motivo);
  const esperaByDate = new Map<string, { id: string; nome: string; telefone: string }[]>();
  for (const e of agenda.espera) {
    if (!esperaByDate.has(e.data)) esperaByDate.set(e.data, []);
    esperaByDate.get(e.data)!.push({ id: e.id, nome: e.nome, telefone: e.telefone });
  }

  const [ano, mes] = mesISO.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(ano, mes - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${mesISO}-${String(i + 1).padStart(2, "0")}`),
  ];

  const prevMes = addMonthsToMes(mesISO, -1);
  const nextMes = addMonthsToMes(mesISO, 1);
  const mesAtualISO = todayISO.slice(0, 7);

  const diaSelecionado = selected
    ? {
        iso: selected,
        festas: festasByDate.get(selected) ?? [],
        bloqueado: bloqueioByDate.has(selected),
        bloqueioMotivo: bloqueioByDate.get(selected) ?? "",
        espera: esperaByDate.get(selected) ?? [],
      }
    : null;

  const handleBlock = () => {
    if (!diaSelecionado) return;
    const data = diaSelecionado.iso;
    const motivoAtual = motivo;
    startTransition(async () => {
      await blockDateAction(data, motivoAtual);
      setMotivo("");
    });
  };

  const handleUnblock = () => {
    if (!diaSelecionado) return;
    startTransition(() => unblockDateAction(diaSelecionado.iso));
  };

  const handleRemoveWaitlist = (id: string) => {
    startTransition(() => removeFromWaitlistAction(id));
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 rounded-xl border border-cream/10 bg-cream/5 p-3 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Link
            href={`/crm/agenda?mes=${prevMes}`}
            aria-label="Mês anterior"
            className="focus-gold flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cream/15 text-cream transition-colors hover:border-gold hover:text-gold"
          >
            ‹
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-display text-base text-cream sm:text-xl">
              {MONTH_LABELS[mes - 1]} {ano}
            </span>
            {mesISO !== mesAtualISO && (
              <Link
                href="/crm/agenda"
                className="focus-gold shrink-0 rounded-full bg-cream/10 px-3 py-1 text-xs font-semibold text-cream hover:bg-cream/15"
              >
                Hoje
              </Link>
            )}
          </div>
          <Link
            href={`/crm/agenda?mes=${nextMes}`}
            aria-label="Próximo mês"
            className="focus-gold flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cream/15 text-cream transition-colors hover:border-gold hover:text-gold"
          >
            ›
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-cream/50 sm:text-xs">
          {WEEKDAY_LABELS.map((d, i) => (
            <span key={i} className="py-1">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((iso, i) => {
            if (!iso) return <span key={`blank-${i}`} />;
            const festas = festasByDate.get(iso) ?? [];
            const bloqueado = bloqueioByDate.has(iso);
            const espera = esperaByDate.get(iso) ?? [];
            const isToday = iso === todayISO;
            const isSelected = iso === selected;
            const dia = Number(iso.slice(-2));

            let cellClasses = "border-cream/10 text-cream/70 hover:bg-cream/10";
            if (festas.length > 0) cellClasses = "border-gold/50 bg-gold/15 text-gold";
            else if (bloqueado) cellClasses = "border-cream/20 bg-cream/10 text-cream/40";

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelected(iso)}
                className={`focus-gold relative flex aspect-square flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg border p-0.5 text-xs transition-colors sm:text-sm ${cellClasses} ${
                  isSelected ? "ring-2 ring-gold" : ""
                }`}
              >
                <span className={isToday ? "font-bold underline underline-offset-2" : ""}>{dia}</span>
                <span className="hidden w-full truncate px-1 text-center text-[10px] leading-tight sm:block">
                  {festas.length > 0
                    ? festas.map((f) => f.nome.split(/\s+/)[0]).join(", ")
                    : bloqueado
                      ? "Bloqueado"
                      : ""}
                </span>
                <span className="flex gap-0.5 sm:hidden">
                  {festas.length > 0 && <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />}
                  {bloqueado && <span className="h-1 w-1 rounded-full bg-cream/50" aria-hidden="true" />}
                </span>
                {espera.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cream px-1 text-[9px] font-bold text-ink">
                    {espera.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-cream/60">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gold" aria-hidden="true" />
            Festa fechada
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cream/30" aria-hidden="true" />
            Bloqueado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cream" aria-hidden="true" />
            Lista de espera
          </span>
        </div>
      </div>

      <div className="min-w-0 rounded-xl border border-cream/10 bg-cream/5 p-5">
        {!diaSelecionado ? (
          <p className="text-sm text-cream/60">Selecione um dia no calendário para ver os detalhes.</p>
        ) : (
          <div>
            <h3 className="font-display text-lg capitalize text-cream">
              {dateFormatterCompleto.format(new Date(`${diaSelecionado.iso}T00:00:00`))}
            </h3>

            <div className="mt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-cream/60">
                Festas do dia
              </h4>
              {diaSelecionado.festas.length === 0 ? (
                <p className="mt-1 text-sm text-cream/50">Nenhuma festa fechada.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1">
                  {diaSelecionado.festas.map((f) => (
                    <li key={f.id}>
                      <Link
                        href={`/crm/leads/${f.id}`}
                        className="focus-gold text-sm font-medium text-cream hover:text-gold"
                      >
                        {f.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5 border-t border-cream/10 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-cream/60">Bloqueio</h4>
              {diaSelecionado.bloqueado ? (
                <div className="mt-2">
                  <p className="text-sm text-cream">
                    {diaSelecionado.bloqueioMotivo || "Sem motivo informado."}
                  </p>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleUnblock}
                    className="focus-gold mt-2 rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-cream/15 disabled:opacity-60"
                  >
                    Desbloquear
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  <input
                    type="text"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Motivo (opcional)"
                    className="focus-gold w-full rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm text-cream outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleBlock}
                    className="focus-gold self-start rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-cream/15 disabled:opacity-60"
                  >
                    Bloquear data
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-cream/10 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-cream/60">
                Lista de espera
              </h4>
              {diaSelecionado.espera.length === 0 ? (
                <p className="mt-1 text-sm text-cream/50">Ninguém esperando essa data.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-2">
                  {diaSelecionado.espera.map((p) => {
                    const primeiroNome = p.nome.trim().split(/\s+/)[0];
                    const texto =
                      `Olá, ${primeiroNome}! Aqui é da Rosa Buffet. Você está na nossa lista de espera ` +
                      `para o dia ${formatDiaMes(diaSelecionado.iso)}. Qualquer novidade a gente já te avisa por aqui!`;
                    const url = `https://wa.me/${toWhatsappNumber(p.telefone)}?text=${encodeURIComponent(texto)}`;
                    return (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-cream/10 p-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-cream">{p.nome}</p>
                          <p className="text-xs text-cream/60">{maskPhone(p.telefone)}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="focus-gold rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-gold-soft"
                          >
                            WhatsApp
                          </a>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleRemoveWaitlist(p.id)}
                            aria-label="Remover da lista de espera"
                            className="focus-gold rounded-full p-1.5 text-cream/50 transition-colors hover:text-cream disabled:opacity-60"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
