"use client";

import { useTransition } from "react";
import { updateVisitaStatusAction } from "@/lib/crm/visitas-actions";
import { toWhatsappNumber } from "@/lib/crm/whatsapp";
import type { VisitaStatus } from "@/lib/visitas";

const STATUS_LABELS: Record<VisitaStatus, string> = {
  agendada: "Agendada",
  confirmada: "Confirmada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  nao_compareceu: "Não compareceu",
};

const STATUS_CLASSES: Record<VisitaStatus, string> = {
  agendada: "bg-cream/10 text-cream",
  confirmada: "bg-gold/15 text-gold",
  realizada: "bg-emerald-500/15 text-emerald-300",
  cancelada: "bg-cream/10 text-cream/40",
  nao_compareceu: "bg-red-500/15 text-red-300",
};

export function VisitaStatusBadge({ status }: { status: VisitaStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function VisitaActions({
  visitaId,
  status,
  leadId,
  nome,
  telefone,
  data,
  hora,
}: {
  visitaId: string;
  status: VisitaStatus;
  leadId: string | null;
  nome: string;
  telefone: string;
  data: string;
  hora: string;
}) {
  const [isPending, startTransition] = useTransition();

  const setStatus = (novo: VisitaStatus) => {
    startTransition(() => updateVisitaStatusAction(visitaId, novo, leadId));
  };

  const [, mes, dia] = data.split("-");
  const primeiroNome = nome.trim().split(/\s+/)[0];
  const textoWhats =
    `Olá, ${primeiroNome}! Aqui é da Rosa Buffet. Confirmando sua visita ao salão no dia ` +
    `${dia}/${mes} às ${hora}. Podemos confirmar?`;
  const whatsappUrl = `https://wa.me/${toWhatsappNumber(telefone)}?text=${encodeURIComponent(textoWhats)}`;

  const ativa = status === "agendada" || status === "confirmada";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-gold rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-gold-soft"
      >
        WhatsApp
      </a>
      {status === "agendada" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setStatus("confirmada")}
          className="focus-gold rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-cream/15 disabled:opacity-60"
        >
          Confirmar
        </button>
      )}
      {ativa && (
        <>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setStatus("realizada")}
            className="focus-gold rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-cream/15 disabled:opacity-60"
          >
            Realizada
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setStatus("nao_compareceu")}
            className="focus-gold rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-cream/15 disabled:opacity-60"
          >
            Não compareceu
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setStatus("cancelada")}
            className="focus-gold rounded-full p-1.5 text-cream/50 transition-colors hover:text-cream disabled:opacity-60"
            aria-label="Cancelar visita"
          >
            Cancelar
          </button>
        </>
      )}
    </div>
  );
}
