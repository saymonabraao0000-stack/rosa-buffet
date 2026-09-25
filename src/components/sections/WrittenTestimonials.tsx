"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

type DepoimentoPublico = { nome: string; nota: number; texto: string };

// Faixa de depoimentos escritos (aprovados no CRM), carregada no cliente via
// GET /api/depoimentos porque a home é estática (o cache do OpenNext é só
// leitura — não dá pra usar revalidatePath aqui). Some completamente sem
// deixar espaço vazio quando não há nenhum depoimento aprovado ainda.
export default function WrittenTestimonials() {
  const [depoimentos, setDepoimentos] = useState<DepoimentoPublico[] | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const res = await fetch("/api/depoimentos");
        const data: { depoimentos?: DepoimentoPublico[] } = res.ok ? await res.json() : {};
        if (ativo) setDepoimentos(Array.isArray(data.depoimentos) ? data.depoimentos : []);
      } catch {
        if (ativo) setDepoimentos([]);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  if (!depoimentos || depoimentos.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="mx-auto w-[min(1120px,calc(100%-48px))]">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {depoimentos.map((d, index) => (
            <figure
              key={`${d.nome}-${index}`}
              className="flex flex-col gap-3 rounded-2xl border border-cream/10 bg-cream/[0.04] p-6"
            >
              <Quote className="h-5 w-5 text-gold/70" aria-hidden="true" />
              <blockquote className="flex-1 text-sm leading-relaxed text-cream/80">
                &ldquo;{d.texto}&rdquo;
              </blockquote>
              <figcaption className="flex items-center justify-between pt-1">
                <span className="font-display text-sm text-cream">{d.nome}</span>
                <span className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      className={`h-3.5 w-3.5 ${v <= d.nota ? "fill-gold text-gold" : "fill-transparent text-cream/20"}`}
                      aria-hidden="true"
                    />
                  ))}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
