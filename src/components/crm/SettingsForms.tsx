"use client";

import { useActionState } from "react";
import {
  saveCondicoesPagamentoAction,
  saveLinkAvaliacaoAction,
  saveModelosWhatsappAction,
  type SaveSettingState,
} from "@/lib/crm/settings-actions";
import type { ModelosWhatsapp } from "@/lib/crm/settings";

function SaveButton({ isPending, ok }: { isPending: boolean; ok?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={isPending}
        className="focus-gold self-start rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
      {ok && <span className="text-sm text-gold">Salvo.</span>}
    </div>
  );
}

export function CondicoesPagamentoForm({ value }: { value: string }) {
  const [state, formAction, isPending] = useActionState<SaveSettingState, FormData>(
    saveCondicoesPagamentoAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="condicoes_pagamento"
        defaultValue={value}
        rows={3}
        className="focus-gold w-full rounded-lg border border-cream/15 bg-ink px-4 py-3 text-sm text-cream outline-none focus:border-gold"
      />
      <SaveButton isPending={isPending} ok={state?.ok} />
    </form>
  );
}

export function LinkAvaliacaoForm({ value }: { value: string }) {
  const [state, formAction, isPending] = useActionState<SaveSettingState, FormData>(
    saveLinkAvaliacaoAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        type="url"
        name="link_avaliacao_google"
        defaultValue={value}
        placeholder="https://g.page/r/.../review"
        className="focus-gold w-full rounded-lg border border-cream/15 bg-ink px-4 py-3 text-sm text-cream placeholder:text-cream/30 outline-none focus:border-gold"
      />
      <p className="text-xs text-cream/50">
        Vazio: a mensagem pós-festa pede só o depoimento, sem falar de avaliação no Google.
      </p>
      <SaveButton isPending={isPending} ok={state?.ok} />
    </form>
  );
}

const MODELOS_FIELDS: { key: keyof ModelosWhatsapp; label: string }[] = [
  { key: "primeiroContato", label: "Primeiro contato" },
  { key: "retomarSimulacao", label: "Retomar simulação" },
  { key: "cobrarOrcamento", label: "Cobrar resposta do orçamento" },
  { key: "reservaConfirmada", label: "Reserva confirmada (sinal)" },
  { key: "lembreteSaldo", label: "Lembrete do saldo" },
  { key: "posFesta", label: "Pós-festa (avaliação + depoimento)" },
];

export function ModelosWhatsappForm({ value }: { value: ModelosWhatsapp }) {
  const [state, formAction, isPending] = useActionState<SaveSettingState, FormData>(
    saveModelosWhatsappAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <p className="text-xs text-cream/50">
        Variáveis disponíveis:{" "}
        <code className="rounded bg-cream/10 px-1.5 py-0.5">{"{nome}"}</code>{" "}
        <code className="rounded bg-cream/10 px-1.5 py-0.5">{"{tema}"}</code>{" "}
        <code className="rounded bg-cream/10 px-1.5 py-0.5">{"{data}"}</code>{" "}
        <code className="rounded bg-cream/10 px-1.5 py-0.5">{"{valor}"}</code>{" "}
        <code className="rounded bg-cream/10 px-1.5 py-0.5">{"{saldo}"}</code>{" "}
        <code className="rounded bg-cream/10 px-1.5 py-0.5">{"{link_avaliacao}"}</code>{" "}
        <code className="rounded bg-cream/10 px-1.5 py-0.5">{"{link_depoimento}"}</code>
      </p>

      {MODELOS_FIELDS.map((field) => (
        <div key={field.key}>
          <label
            htmlFor={field.key}
            className="mb-2 block text-sm font-medium text-cream"
          >
            {field.label}
          </label>
          <textarea
            id={field.key}
            name={field.key}
            defaultValue={value[field.key]}
            rows={3}
            className="focus-gold w-full rounded-lg border border-cream/15 bg-ink px-4 py-3 text-sm text-cream outline-none focus:border-gold"
          />
        </div>
      ))}

      <SaveButton isPending={isPending} ok={state?.ok} />
    </form>
  );
}
