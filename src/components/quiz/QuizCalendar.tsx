"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatISODate } from "@/lib/availability-data";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MONTHS_AHEAD = 6;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sameDay(a: Date | null, b: Date) {
  return (
    !!a &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type QuizCalendarProps = {
  value: Date | null;
  bookedDates: string[];
  onSelect: (date: Date) => void;
};

export default function QuizCalendar({ value, bookedDates, onSelect }: QuizCalendarProps) {
  const today = startOfDay(new Date());
  const minMonth = startOfMonth(today);
  const maxMonth = new Date(minMonth.getFullYear(), minMonth.getMonth() + MONTHS_AHEAD, 1);
  const [viewMonth, setViewMonth] = useState(minMonth);

  const canGoPrev = viewMonth.getTime() > minMonth.getTime();
  const canGoNext = viewMonth.getTime() < maxMonth.getTime();

  const firstWeekday = viewMonth.getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1)),
  ];

  return (
    <div className="w-full max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canGoPrev && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          disabled={!canGoPrev}
          aria-label="Mês anterior"
          className="focus-gold flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink transition-colors hover:bg-gray-light disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="font-display text-lg text-ink">
          {MONTH_LABELS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() => canGoNext && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          disabled={!canGoNext}
          aria-label="Próximo mês"
          className="focus-gold flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink transition-colors hover:bg-gray-light disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-gray-dark">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />;
          const past = date.getTime() < today.getTime();
          const booked = bookedDates.includes(formatISODate(date));
          const disabled = past || booked;
          const selected = sameDay(value, date);
          return (
            <button
              key={formatISODate(date)}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              title={booked ? "Data indisponível" : undefined}
              className={`focus-gold aspect-square rounded-lg text-sm transition-colors ${
                selected
                  ? "bg-gold font-semibold text-ink"
                  : disabled
                    ? "cursor-not-allowed text-ink/25 line-through"
                    : "text-ink hover:bg-gold-soft/30"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-dark">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gold" aria-hidden="true" />
          Selecionada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" aria-hidden="true" />
          Indisponível
        </span>
      </div>
    </div>
  );
}
