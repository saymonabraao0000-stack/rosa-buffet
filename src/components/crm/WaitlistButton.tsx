"use client";

import { useState, useTransition } from "react";
import { addToWaitlistAction, removeFromWaitlistAction } from "@/lib/crm/agenda-actions";

// Item 9 — botão da ficha do lead pra entrar/sair da lista de espera de uma
// data já ocupada. `waitlistId` inicial vem do server (se o lead já estava
// na lista); depois de "Pôr na lista de espera" guardamos o id devolvido
// pela action pra poder remover sem recarregar a página.
export default function WaitlistButton({
  leadId,
  nome,
  telefone,
  data,
  emEspera,
  waitlistId,
}: {
  leadId: string;
  nome: string;
  telefone: string;
  data: string;
  emEspera: boolean;
  waitlistId: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState({ emEspera, waitlistId });

  const add = () => {
    startTransition(async () => {
      const result = await addToWaitlistAction({ leadId, nome, telefone, data });
      setState({ emEspera: true, waitlistId: result.id });
    });
  };

  const remove = () => {
    if (!state.waitlistId) return;
    const id = state.waitlistId;
    startTransition(async () => {
      await removeFromWaitlistAction(id, leadId);
      setState({ emEspera: false, waitlistId: null });
    });
  };

  if (state.emEspera) {
    return (
      <button
        type="button"
        disabled={isPending || !state.waitlistId}
        onClick={remove}
        className="focus-gold shrink-0 rounded-full bg-cream/10 px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-cream/15 disabled:opacity-60"
      >
        Na lista de espera ✓ (remover)
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={add}
      className="focus-gold shrink-0 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-gold-soft disabled:opacity-60"
    >
      Pôr na lista de espera
    </button>
  );
}
