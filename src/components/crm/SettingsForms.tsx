"use client";

import { useActionState } from "react";
import {
  saveCondicoesPagamentoAction,
  saveLinkAvaliacaoAction,
  saveModelosWhatsappAction,
  savePrecosAction,
  restorePrecosAction,
  type SaveSettingState,
} from "@/lib/crm/settings-actions";
import type { ModelosWhatsapp, PrecosSetting } from "@/lib/crm/settings";
import { partyPackages, guestOptions } from "@/lib/quiz-data";

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

const GUEST_BRACKETS = guestOptions
  .map((g) => g.guests)
  .filter((g): g is number => g != null);

export function PrecosForm({ value }: { value: PrecosSetting }) {
  const [state, formAction, isPending] = useActionState<SaveSettingState, FormData>(
    savePrecosAction,
    undefined,
  );
  const [restoreState, restoreAction, isRestoring] = useActionState<SaveSettingState, FormData>(
    restorePrecosAction,
    undefined,
  );

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-5">
        {partyPackages.map((pkg) => {
          const pkgValue = value[pkg.slug];
          return (
            <div
              key={pkg.slug}
              className="rounded-lg border border-cream/10 bg-ink p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg text-cream">{pkg.label}</h3>
                  <p className="text-xs text-cream/50">{pkg.tagline}</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <a
                    href={`/PDFs/Rosa-Buffet-Pacote-${pkg.label}-Apresentacao.pdf`}
                    download
                    className="focus-gold text-cream/70 underline decoration-cream/30 underline-offset-2 hover:text-gold"
                  >
                    Baixar PDF
                  </a>
                  <a
                    href={`/pacotes/${pkg.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-gold text-cream/70 underline decoration-cream/30 underline-offset-2 hover:text-gold"
                  >
                    Ver página
                  </a>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {GUEST_BRACKETS.map((guests) => (
                  <div key={guests} className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`preco_${pkg.slug}_${guests}`}
                      className="text-xs font-medium text-cream/70"
                    >
                      {guests} convidados
                    </label>
                    <input
                      id={`preco_${pkg.slug}_${guests}`}
                      name={`preco_${pkg.slug}_${guests}`}
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      defaultValue={pkgValue?.pricesByGuests[guests] ?? ""}
                      placeholder="Sob consulta"
                      className="focus-gold w-full rounded-lg border border-cream/15 bg-ink-soft px-3 py-2 text-sm text-cream placeholder:text-cream/30 outline-none focus:border-gold"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label
                  htmlFor={`nota_${pkg.slug}`}
                  className="mb-1.5 block text-xs font-medium text-cream/70"
                >
                  Nota do pacote
                </label>
                <textarea
                  id={`nota_${pkg.slug}`}
                  name={`nota_${pkg.slug}`}
                  defaultValue={pkgValue?.note ?? ""}
                  rows={2}
                  className="focus-gold w-full rounded-lg border border-cream/15 bg-ink-soft px-3 py-2 text-sm text-cream outline-none focus:border-gold"
                />
              </div>
            </div>
          );
        })}

        <p className="text-xs text-cream/50">
          Deixe o campo vazio para o pacote aparecer como &quot;sob consulta&quot; naquela faixa.
        </p>

        <SaveButton isPending={isPending} ok={state?.ok} />
      </form>

      <form action={restoreAction}>
        <button
          type="submit"
          disabled={isRestoring}
          className="focus-gold self-start rounded-full border border-cream/20 px-5 py-2.5 text-sm font-semibold text-cream/80 transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRestoring ? "Restaurando..." : "Restaurar preços padrão"}
        </button>
        {restoreState?.ok && <span className="ml-3 text-sm text-gold">Restaurado.</span>}
      </form>
    </div>
  );
}
