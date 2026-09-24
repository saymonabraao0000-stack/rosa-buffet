"use client";

import { useTransition } from "react";
import { markRecompraAvisadaAction } from "@/lib/crm/agenda-actions";

// Item 8 — dashboard "Oferecer a festa do ano que vem": marca que já ofereceu
// a recompra pra este lead (grava recompra_avisada_em, evita repetir por ~300 dias).
export default function RecompraOfertaButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => markRecompraAvisadaAction(id))}
      className="focus-gold shrink-0 rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-cream/15 disabled:opacity-60"
    >
      {isPending ? "Salvando..." : "Já ofereci"}
    </button>
  );
}
