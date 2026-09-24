"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitTestimonialAction } from "@/lib/crm/testimonial-actions";

type TestimonialFormProps = {
  token: string;
  nomeInicial: string;
};

export default function TestimonialForm({ token, nomeInicial }: TestimonialFormProps) {
  const [isPending, startTransition] = useTransition();
  const [nota, setNota] = useState(5);
  const [hoverNota, setHoverNota] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  if (enviado) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-gold/10 px-6 py-8 text-center">
        <p className="font-display text-xl text-ink">Muito obrigado!</p>
        <p className="mt-2 text-sm text-gray-dark">
          Seu depoimento chegou para a gente. Foi um prazer produzir a sua festa 💛
        </p>
      </div>
    );
  }

  return (
    <form
      action={(formData: FormData) => {
        setError(null);
        formData.set("nota", String(nota));
        startTransition(async () => {
          const result = await submitTestimonialAction(token, formData);
          if (result.ok) {
            setEnviado(true);
          } else {
            setError(result.error);
          }
        });
      }}
      className="flex flex-col gap-5"
    >
      {/* Honeypot: campo invisível para humanos, robôs de spam costumam preencher tudo. */}
      <input
        type="text"
        name="site"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
        Seu nome
        <input
          type="text"
          name="nome"
          required
          defaultValue={nomeInicial}
          className="focus-gold rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Sua nota</span>
        <div className="flex gap-1" role="radiogroup" aria-label="Nota de 1 a 5 estrelas">
          {[1, 2, 3, 4, 5].map((valor) => {
            const preenchida = valor <= (hoverNota ?? nota);
            return (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={valor === nota}
                aria-label={`${valor} estrela${valor > 1 ? "s" : ""}`}
                onClick={() => setNota(valor)}
                onMouseEnter={() => setHoverNota(valor)}
                onMouseLeave={() => setHoverNota(null)}
                className="focus-gold rounded-md p-1"
              >
                <Star
                  className={`h-8 w-8 ${preenchida ? "fill-gold text-gold" : "fill-transparent text-ink/20"}`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
        Como foi a experiência com a Rosa Buffet?
        <textarea
          name="texto"
          required
          minLength={10}
          maxLength={1000}
          rows={5}
          placeholder="Conte pra gente como foi a sua festa..."
          className="focus-gold rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
        />
      </label>

      <label className="flex items-start gap-2.5 text-sm text-gray-dark">
        <input
          type="checkbox"
          name="consentimento"
          required
          className="focus-gold mt-0.5 h-4 w-4 shrink-0 accent-gold"
        />
        Autorizo a Rosa Buffet a publicar este depoimento no site (só o primeiro nome aparece).
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="focus-gold rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Enviar depoimento"}
      </button>
    </form>
  );
}
