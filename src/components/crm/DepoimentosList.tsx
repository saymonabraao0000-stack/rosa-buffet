"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Star, Check, X, Trash2 } from "lucide-react";
import {
  approveTestimonialAction,
  deleteTestimonialAction,
  rejectTestimonialAction,
} from "@/lib/crm/testimonial-actions";
import type { TestimonialWithLead } from "@/lib/crm/testimonials";

type Status = "pendente" | "aprovado" | "recusado";

const TABS: { value: Status; label: string }[] = [
  { value: "pendente", label: "Pendentes" },
  { value: "aprovado", label: "Aprovados" },
  { value: "recusado", label: "Recusados" },
];

type DepoimentosListProps = {
  porStatus: Record<Status, TestimonialWithLead[]>;
};

export default function DepoimentosList({ porStatus }: DepoimentosListProps) {
  const [tab, setTab] = useState<Status>("pendente");
  const items = porStatus[tab];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`focus-gold shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              tab === t.value ? "bg-gold text-ink" : "bg-cream/10 text-cream/70 hover:bg-cream/15"
            }`}
          >
            {t.label} ({porStatus[t.value].length})
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {items.length === 0 ? (
          <p className="text-sm text-cream/50">Nenhum depoimento aqui ainda.</p>
        ) : (
          items.map((item) => <DepoimentoCard key={item.id} item={item} status={tab} />)
        )}
      </div>
    </div>
  );
}

function DepoimentoCard({ item, status }: { item: TestimonialWithLead; status: Status }) {
  const [isPending, startTransition] = useTransition();
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const data = new Date(item.createdAt).toLocaleDateString("pt-BR");

  const handleDelete = () => {
    if (!confirm("Excluir este depoimento? Essa ação não pode ser desfeita.")) return;
    startTransition(async () => {
      await deleteTestimonialAction(item.id);
      setHidden(true);
    });
  };

  return (
    <div className="rounded-xl border border-cream/10 bg-cream/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg text-cream">{item.nome ?? "—"}</p>
          {item.leadId && (
            <Link
              href={`/crm/leads/${item.leadId}`}
              className="focus-gold text-xs text-gold underline underline-offset-2 hover:text-gold-soft"
            >
              Ver ficha{item.leadNome ? ` de ${item.leadNome}` : ""}
            </Link>
          )}
        </div>
        <span className="shrink-0 text-xs text-cream/40">{data}</span>
      </div>

      {item.nota != null && (
        <div className="mt-2 flex gap-0.5">
          {[1, 2, 3, 4, 5].map((v) => (
            <Star
              key={v}
              className={`h-4 w-4 ${v <= item.nota! ? "fill-gold text-gold" : "fill-transparent text-cream/20"}`}
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {item.texto ? (
        <p className="mt-3 text-sm leading-relaxed text-cream/80">{item.texto}</p>
      ) : (
        <p className="mt-3 text-sm italic text-cream/40">Ainda não respondido.</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {status !== "aprovado" && item.texto && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => approveTestimonialAction(item.id))}
            className="focus-gold flex items-center gap-1.5 rounded-full bg-green-500/15 px-3.5 py-2 text-xs font-semibold text-green-300 transition-colors hover:bg-green-500/25 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Aprovar
          </button>
        )}
        {status !== "recusado" && item.texto && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => rejectTestimonialAction(item.id))}
            className="focus-gold flex items-center gap-1.5 rounded-full bg-cream/10 px-3.5 py-2 text-xs font-semibold text-cream transition-colors hover:bg-cream/15 disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Recusar
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="focus-gold flex items-center gap-1.5 rounded-full bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Excluir
        </button>
      </div>
    </div>
  );
}
