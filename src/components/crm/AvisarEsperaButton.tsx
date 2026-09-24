"use client";

import { useTransition } from "react";
import { markWaitlistAvisadoAction } from "@/lib/crm/agenda-actions";

// Item 9 — dashboard "Data liberada — pessoas esperando": marca que já avisou
// esta pessoa da lista de espera que a data ficou disponível (grava avisado_em).
export default function AvisarEsperaButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => markWaitlistAvisadoAction(id))}
      className="focus-gold shrink-0 rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-cream/15 disabled:opacity-60"
    >
      {isPending ? "Salvando..." : "Já avisei"}
    </button>
  );
}
