"use client";

import { useState, useTransition } from "react";
import { updateLeadStatusAction } from "@/lib/crm/actions";
import type { LeadStatus } from "@/lib/crm/types";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "novo", label: "Novo" },
  { value: "contatado", label: "Contatado" },
  { value: "orcamento_enviado", label: "Orçamento enviado" },
  { value: "fechado", label: "Fechado" },
  { value: "perdido", label: "Perdido" },
];

type StatusFormProps = {
  leadId: string;
  currentStatus: LeadStatus;
  currentMotivo: string | null;
};

export default function StatusForm({ leadId, currentStatus, currentMotivo }: StatusFormProps) {
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [motivo, setMotivo] = useState(currentMotivo ?? "");
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus: LeadStatus) => {
    setStatus(newStatus);
    if (newStatus !== "perdido") {
      startTransition(() => updateLeadStatusAction(leadId, newStatus));
    }
  };

  return (
    <div>
      <label htmlFor="status" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-dark">
        Status
      </label>
      <select
        id="status"
        value={status}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as LeadStatus)}
        className="focus-gold w-full rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold disabled:opacity-60"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {status === "perdido" && (
        <div className="mt-3">
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo da perda (opcional)"
            rows={2}
            className="focus-gold w-full rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => updateLeadStatusAction(leadId, "perdido", motivo))}
            className="focus-gold mt-2 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            {isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      )}
    </div>
  );
}
