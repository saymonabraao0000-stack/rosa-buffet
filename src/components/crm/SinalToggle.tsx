"use client";

import { useTransition } from "react";
import { markSinalPagoAction } from "@/lib/crm/actions";

export default function SinalToggle({ leadId, sinalPago }: { leadId: string; sinalPago: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => markSinalPagoAction(leadId, !sinalPago))}
      className={`focus-gold rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
        sinalPago ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-ink/10 text-ink hover:bg-ink/15"
      }`}
    >
      {sinalPago ? "✓ Sinal pago" : "Marcar sinal como pago"}
    </button>
  );
}
