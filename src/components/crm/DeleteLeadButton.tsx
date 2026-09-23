"use client";

import { useTransition } from "react";
import { deleteLeadAction } from "@/lib/crm/actions";

export default function DeleteLeadButton({ leadId, nome }: { leadId: string; nome: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`Excluir o lead "${nome}" e as anotações dele? Não dá para desfazer.`)) return;
        startTransition(() => deleteLeadAction(leadId));
      }}
      className="focus-gold rounded-full px-4 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/15 disabled:opacity-60"
    >
      {isPending ? "Excluindo…" : "Excluir lead"}
    </button>
  );
}
