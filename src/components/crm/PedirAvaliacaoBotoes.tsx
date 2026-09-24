"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAvaliacaoPedidaAction } from "@/lib/crm/pos-festa-actions";

// Lembrete "Pedir avaliação" do dashboard: o link do WhatsApp é um <a> normal
// (não navega via JS, então nada bloqueia a abertura no celular) — o clique
// também dispara a marcação via Server Action, sem `preventDefault` nem
// `await` na frente da navegação. O botão "Já pedi" cobre quem prefere só
// marcar sem mandar mensagem agora.
export default function PedirAvaliacaoBotoes({ id, whatsappUrl }: { id: string; whatsappUrl: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const marcar = () =>
    startTransition(async () => {
      await markAvaliacaoPedidaAction(id);
      router.refresh();
    });

  return (
    <div className="flex shrink-0 items-center gap-2">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={marcar}
        className="focus-gold rounded-full bg-gold px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-gold-soft"
      >
        WhatsApp
      </a>
      <button
        type="button"
        disabled={isPending}
        onClick={marcar}
        className="focus-gold shrink-0 rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-cream/15 disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Já pedi"}
      </button>
    </div>
  );
}
