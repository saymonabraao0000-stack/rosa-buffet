"use client";

import { useState, useTransition } from "react";
import { updateLeadRetornarEmAction } from "@/lib/crm/actions";
import { addDaysISO } from "@/lib/crm/manaus-date";

// Item 1 — lembrete de retorno: data + atalhos (amanhã, 3 dias, 1 semana, limpar).
export default function RetornarEmForm({
  leadId,
  retornarEm,
  todayISO,
}: {
  leadId: string;
  retornarEm: string | null;
  todayISO: string;
}) {
  const [value, setValue] = useState(retornarEm ?? "");
  const [isPending, startTransition] = useTransition();

  const save = (date: string | null) => {
    setValue(date ?? "");
    startTransition(() => updateLeadRetornarEmAction(leadId, date));
  };

  return (
    <div>
      <label
        htmlFor="retornarEm"
        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-cream/60"
      >
        Retornar em
      </label>
      <input
        id="retornarEm"
        type="date"
        value={value}
        disabled={isPending}
        onChange={(e) => save(e.target.value || null)}
        className="focus-gold w-full rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm text-cream outline-none focus:border-gold disabled:opacity-60 [color-scheme:dark]"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <QuickButton label="Amanhã" disabled={isPending} onClick={() => save(addDaysISO(todayISO, 1))} />
        <QuickButton label="3 dias" disabled={isPending} onClick={() => save(addDaysISO(todayISO, 3))} />
        <QuickButton label="1 semana" disabled={isPending} onClick={() => save(addDaysISO(todayISO, 7))} />
        <QuickButton label="Limpar" disabled={isPending} onClick={() => save(null)} />
      </div>
    </div>
  );
}

function QuickButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="focus-gold rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-cream/15 disabled:opacity-60"
    >
      {label}
    </button>
  );
}
