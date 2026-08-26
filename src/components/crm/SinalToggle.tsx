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
        sinalPago ? "bg-green-500/15 text-green-300 hover:bg-green-500/25" : "bg-cream/10 text-cream hover:bg-cream/15"
      }`}
    >
      {sinalPago ? "✓ Sinal pago" : "Marcar sinal como pago"}
    </button>
  );
}
