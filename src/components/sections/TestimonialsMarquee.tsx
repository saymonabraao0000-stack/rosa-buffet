"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { testimonialScreenshots, type TestimonialScreenshot } from "@/lib/testimonials-data";

type DbPrint = { id: string; width: number; height: number };

// Item unificado: ou uma foto estática (public/images/depoimentos, next/image)
// ou um print do banco (servido por /api/prints/[id], <img> simples).
type MarqueeItem =
  | { kind: "static"; src: string; w: number; h: number }
  | { kind: "db"; id: string; w: number; h: number };

const SECONDS_PER_ITEM = 3.5;
const MIN_DURATION_SECONDS = 90;

/**
 * Faixa do carrossel de depoimentos. Renderiza os estáticos primeiro (igual
 * ao SSR de sempre, sem layout shift nem faixa vazia) e, quando GET
 * /api/prints responder, acrescenta os prints do banco NO INÍCIO da lista
 * (mais novos primeiro). A faixa é duplicada e a animação translada -50% —
 * continua funcionando porque cada item carrega o próprio espaçamento
 * (pr-5), então as duas metades sempre têm a mesma largura.
 */
export default function TestimonialsMarquee() {
  const [dbPrints, setDbPrints] = useState<DbPrint[]>([]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const res = await fetch("/api/prints");
        const data: { prints?: DbPrint[] } = res.ok ? await res.json() : {};
        if (ativo && Array.isArray(data.prints)) setDbPrints(data.prints);
      } catch {
        // Sem prints do banco: a faixa segue só com os estáticos.
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const items: MarqueeItem[] = useMemo(() => {
    const fromDb: MarqueeItem[] = dbPrints.map((p) => ({ kind: "db", id: p.id, w: p.width, h: p.height }));
    const fromStatic: MarqueeItem[] = (testimonialScreenshots as TestimonialScreenshot[]).map((s) => ({
      kind: "static",
      src: s.src,
      w: s.w,
      h: s.h,
    }));
    return [...fromDb, ...fromStatic];
  }, [dbPrints]);

  const track = useMemo(() => [...items, ...items], [items]);

  const durationSeconds = Math.max(MIN_DURATION_SECONDS, items.length * SECONDS_PER_ITEM);

  return (
    <div
      className="relative mt-8 sm:mt-10"
      style={{ "--marquee-duration": `${durationSeconds}s` } as React.CSSProperties}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent sm:w-32" />

      <div className="flex w-max animate-marquee">
        {track.map((item, index) => {
          const key = item.kind === "static" ? `${item.src}-${index}` : `${item.id}-${index}`;
          return (
            <div key={key} className="shrink-0 pr-4">
              <div className="h-44 overflow-hidden rounded-xl border border-cream/10 sm:h-52">
                {item.kind === "static" ? (
                  <Image
                    src={item.src}
                    alt="Depoimento de cliente da Rosa Buffet"
                    width={item.w}
                    height={item.h}
                    sizes={`${Math.ceil((240 * item.w) / item.h)}px`}
                    loading="eager"
                    className="h-full w-auto object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/prints/${item.id}`}
                    alt="Depoimento de cliente da Rosa Buffet"
                    width={item.w}
                    height={item.h}
                    loading="eager"
                    decoding="async"
                    className="h-full w-auto object-cover"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
