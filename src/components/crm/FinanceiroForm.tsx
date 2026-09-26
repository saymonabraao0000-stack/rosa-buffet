"use client";

import { useState, useTransition } from "react";
import { updateLeadFinanceiroAction } from "@/lib/crm/actions";
import type { Lead } from "@/lib/crm/types";
import { reservationDeposit } from "@/lib/availability-data";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

// Item 4 — financeiro da festa (só para leads fechados): valor fechado,
// sinal (padrão = reservationDeposit), valor já pago, data do pagamento final e "falta receber".
export default function FinanceiroForm({ lead }: { lead: Lead }) {
  const [isPending, startTransition] = useTransition();
  const [valorFechado, setValorFechado] = useState(lead.valorFechado?.toString() ?? "");
  const [valorPago, setValorPago] = useState(lead.valorPago?.toString() ?? "0");

  const falta =
    valorFechado.trim() !== "" ? Number(valorFechado || 0) - Number(valorPago || 0) : null;

  return (
    <form
      action={(formData: FormData) =>
        startTransition(() => updateLeadFinanceiroAction(lead.id, formData))
      }
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NumberField
          label="Valor fechado (R$)"
          name="valorFechado"
          value={valorFechado}
          onChange={setValorFechado}
        />
        <NumberField
          label="Sinal (R$)"
          name="valorSinal"
          defaultValue={(lead.valorSinal ?? reservationDeposit).toString()}
        />
        <NumberField
          label="Já pago (R$)"
          name="valorPago"
          value={valorPago}
          onChange={setValorPago}
        />
        <label className="flex flex-col gap-1 text-sm font-medium text-cream">
          Pagamento final em
          <input
            type="date"
            name="pagamentoFinalEm"
            defaultValue={lead.pagamentoFinalEm ?? undefined}
            className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm font-normal text-cream outline-none focus:border-gold [color-scheme:dark]"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cream/10 pt-3">
        <span className="text-sm text-cream/60">
          Falta receber:{" "}
          <strong className="text-cream">{falta != null ? currency.format(falta) : "-"}</strong>
        </span>
        <button
          type="submit"
          disabled={isPending}
          className="focus-gold rounded-full bg-gold px-5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-gold-soft disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar financeiro"}
        </button>
      </div>
    </form>
  );
}

function NumberField({
  label,
  name,
  value,
  defaultValue,
  onChange,
}: {
  label: string;
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-cream">
      {label}
      <input
        type="number"
        name={name}
        min={0}
        step={1}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm font-normal text-cream outline-none focus:border-gold [color-scheme:dark]"
      />
    </label>
  );
}
