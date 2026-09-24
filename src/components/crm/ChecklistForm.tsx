"use client";

import { useState, useTransition } from "react";
import { updateLeadChecklistAction } from "@/lib/crm/actions";
import { checklistProntos, CHECKLIST_TOTAL_ITENS } from "@/lib/crm/checklist";
import type { Lead, LeadChecklist } from "@/lib/crm/types";

// Item 15 — checklist da festa (leads fechados): itens marcáveis + campos
// curtos, salvos em `checklist` (jsonb). "X/7 prontos" atualiza ao digitar.
export default function ChecklistForm({ lead }: { lead: Lead }) {
  const [isPending, startTransition] = useTransition();
  const [checklist, setChecklist] = useState<LeadChecklist>(lead.checklist ?? {});

  const prontos = checklistProntos(checklist);
  const set = (patch: Partial<LeadChecklist>) => setChecklist((c) => ({ ...c, ...patch }));

  return (
    <form
      action={(formData: FormData) =>
        startTransition(() => updateLeadChecklistAction(lead.id, formData))
      }
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-cream">Checklist da festa</h2>
        <span className="rounded-full bg-cream/10 px-3 py-1 text-xs font-semibold text-cream">
          {prontos}/{CHECKLIST_TOTAL_ITENS} prontos
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <CheckboxField
          label="Cardápio definido"
          name="cardapioDefinido"
          checked={!!checklist.cardapioDefinido}
          onChange={(v) => set({ cardapioDefinido: v })}
        />
        <CheckboxField
          label="Bolo"
          name="bolo"
          checked={!!checklist.bolo}
          onChange={(v) => set({ bolo: v })}
        />
        <CheckboxField
          label="Decoração"
          name="decoracao"
          checked={!!checklist.decoracao}
          onChange={(v) => set({ decoracao: v })}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-cream">
          Número final de convidados
          <input
            type="number"
            name="numeroFinalConvidados"
            min={0}
            value={checklist.numeroFinalConvidados ?? ""}
            onChange={(e) =>
              set({
                numeroFinalConvidados: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm font-normal text-cream outline-none focus:border-gold [color-scheme:dark]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-cream">
          Horário
          <input
            type="text"
            name="horario"
            placeholder="Ex.: 15h às 19h"
            value={checklist.horario ?? ""}
            onChange={(e) => set({ horario: e.target.value })}
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm font-normal text-cream placeholder:text-cream/30 outline-none focus:border-gold"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-cream">
          Degustação marcada
          <input
            type="date"
            name="degustacaoEm"
            value={checklist.degustacaoEm ?? ""}
            onChange={(e) => set({ degustacaoEm: e.target.value })}
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm font-normal text-cream outline-none focus:border-gold [color-scheme:dark]"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-cream">
        Fornecedores / observações
        <textarea
          name="fornecedores"
          rows={2}
          value={checklist.fornecedores ?? ""}
          onChange={(e) => set({ fornecedores: e.target.value })}
          className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm font-normal text-cream placeholder:text-cream/30 outline-none focus:border-gold"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="focus-gold self-start rounded-full bg-gold px-5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-gold-soft disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar checklist"}
      </button>
    </form>
  );
}

function CheckboxField({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-cream/15 px-3 py-2 text-sm text-cream">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-gold"
      />
      {label}
    </label>
  );
}
