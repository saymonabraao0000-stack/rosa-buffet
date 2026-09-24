"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Mês como número absoluto (ano * 12 + mês), pra comparar e somar sem Date. */
type MonthKey = number;

const toKey = (iso: string): MonthKey => {
  const [y, m] = iso.split("-").map(Number);
  return y * 12 + (m - 1);
};
const keyYear = (k: MonthKey) => Math.floor(k / 12);
const keyMonth = (k: MonthKey) => k % 12;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Calendário mensal da página /visita. Recebe só as datas ISO que têm horário
 * livre (vindas do servidor, no fuso de Manaus); todo o resto aparece apagado.
 * Mês e ano podem ser escolhidos direto nos seletores, além das setas.
 */
export default function VisitaCalendar({
  hoje,
  diasLivres,
  selecionado,
  onSelect,
}: {
  hoje: string;
  diasLivres: string[];
  selecionado: string | null;
  onSelect: (iso: string) => void;
}) {
  const livres = useMemo(() => new Set(diasLivres), [diasLivres]);
  const minKey = toKey(hoje);
  const maxKey = diasLivres.length ? Math.max(minKey, toKey(diasLivres[diasLivres.length - 1])) : minKey;
  const [view, setView] = useState<MonthKey>(() =>
    selecionado ? toKey(selecionado) : diasLivres.length ? toKey(diasLivres[0]) : minKey,
  );

  const ano = keyYear(view);
  const mes = keyMonth(view);
  const primeiroDiaSemana = new Date(Date.UTC(ano, mes, 1)).getUTCDay();
  const diasNoMes = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  const livresNoMes = diasLivres.filter((d) => toKey(d) === view).length;

  const anos = Array.from({ length: keyYear(maxKey) - keyYear(minKey) + 1 }, (_, i) => keyYear(minKey) + i);
  const clamp = (k: MonthKey) => Math.min(maxKey, Math.max(minKey, k));

  const selectClass =
    "focus-gold cursor-pointer appearance-none rounded-lg border border-cream/15 bg-ink py-2 pl-3 pr-8 font-display text-base text-cream outline-none [color-scheme:dark] hover:border-gold/60 focus:border-gold";
  const arrowClass =
    "focus-gold flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream/15 text-cream transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-cream/15 disabled:hover:text-cream";

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setView(clamp(view - 1))}
          disabled={view <= minKey}
          aria-label="Mês anterior"
          className={arrowClass}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="visita-mes">Mês</label>
          <span className="relative">
            <select
              id="visita-mes"
              value={mes}
              onChange={(e) => setView(clamp(ano * 12 + Number(e.target.value)))}
              className={selectClass}
            >
              {MONTH_LABELS.map((label, i) => {
                const k = ano * 12 + i;
                return (
                  <option key={label} value={i} disabled={k < minKey || k > maxKey}>
                    {label}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" aria-hidden="true" />
          </span>
          <label className="sr-only" htmlFor="visita-ano">Ano</label>
          <span className="relative">
            <select
              id="visita-ano"
              value={ano}
              onChange={(e) => setView(clamp(Number(e.target.value) * 12 + mes))}
              className={selectClass}
            >
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" aria-hidden="true" />
          </span>
        </div>

        <button
          type="button"
          onClick={() => setView(clamp(view + 1))}
          disabled={view >= maxKey}
          aria-label="Próximo mês"
          className={arrowClass}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-cream/50">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: primeiroDiaSemana }, (_, i) => (
          <span key={`vazio-${i}`} />
        ))}
        {Array.from({ length: diasNoMes }, (_, i) => {
          const iso = `${ano}-${pad(mes + 1)}-${pad(i + 1)}`;
          const livre = livres.has(iso);
          const ativo = selecionado === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={!livre}
              onClick={() => onSelect(iso)}
              aria-pressed={ativo}
              aria-label={livre ? `Dia ${i + 1}, horários livres` : `Dia ${i + 1}, sem horário`}
              className={`focus-gold flex aspect-square items-center justify-center rounded-lg text-sm transition-colors ${
                ativo
                  ? "bg-gold font-semibold text-ink"
                  : livre
                    ? "border border-gold/35 font-medium text-cream hover:border-gold hover:bg-gold/15"
                    : "cursor-not-allowed text-cream/20"
              } ${iso === hoje && !ativo ? "underline decoration-gold underline-offset-4" : ""}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-cream/55">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-gold/60" aria-hidden="true" />
          Dia com horário livre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-gold" aria-hidden="true" />
          Selecionado
        </span>
      </div>

      {livresNoMes === 0 && (
        <p className="mt-4 text-sm text-cream/65">
          Sem horários livres em {MONTH_LABELS[mes].toLowerCase()}. Escolha outro mês.
        </p>
      )}
    </div>
  );
}
