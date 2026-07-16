"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Container from "@/components/ui/Container";
import { portfolioCategories } from "@/lib/portfolio-data";

type FlatImage = { src: string; w: number; h: number; category: string };

const ALL = "todas";

export default function PortfolioGallery() {
  const [active, setActive] = useState<string>(ALL);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filters = useMemo(
    () => [
      { slug: ALL, label: "Todas" },
      ...portfolioCategories.map((c) => ({ slug: c.slug, label: c.label })),
    ],
    [],
  );

  const images: FlatImage[] = useMemo(() => {
    const source =
      active === ALL
        ? portfolioCategories
        : portfolioCategories.filter((c) => c.slug === active);
    return source.flatMap((c) =>
      c.images.map((img) => ({ ...img, category: c.label })),
    );
  }, [active]);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const showPrev = useCallback(
    () => setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const showNext = useCallback(
    () => setLightbox((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, closeLightbox, showPrev, showNext]);

  return (
    <section className="bg-cream pb-24 pt-12 sm:pb-32">
      <Container>
        {/* Filtros por tema */}
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {filters.map((f) => {
            const isActive = active === f.slug;
            return (
              <button
                key={f.slug}
                type="button"
                onClick={() => {
                  setActive(f.slug);
                  setLightbox(null);
                }}
                aria-pressed={isActive}
                className={`focus-gold rounded-full border px-5 py-2 text-sm font-medium tracking-wide transition-all duration-300 ${
                  isActive
                    ? "border-gold bg-gold text-ink"
                    : "border-ink/15 text-gray-dark hover:border-gold hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Grid masonry */}
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4"
        >
          {images.map((img, index) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setLightbox(index)}
              className="focus-gold group relative block w-full overflow-hidden rounded-xl break-inside-avoid"
              aria-label={`Ampliar foto de ${img.category}`}
            >
              <Image
                src={img.src}
                alt={`Evento de ${img.category} realizado pela Rosa Buffet`}
                width={img.w}
                height={img.h}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/25" />
              <span className="pointer-events-none absolute bottom-3 left-3 translate-y-2 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-cream opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {img.category}
              </span>
            </button>
          ))}
        </motion.div>
      </Container>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && images[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Visualização ampliada"
            onClick={closeLightbox}
          >
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Fechar"
              className="focus-gold absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              aria-label="Foto anterior"
              className="focus-gold absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20 sm:left-6"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="Próxima foto"
              className="focus-gold absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20 sm:right-6"
            >
              <ChevronRight className="h-7 w-7" />
            </button>

            <motion.figure
              key={images[lightbox].src}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative flex max-h-full max-w-5xl flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightbox].src}
                alt={`Evento de ${images[lightbox].category} realizado pela Rosa Buffet`}
                width={images[lightbox].w}
                height={images[lightbox].h}
                sizes="90vw"
                className="max-h-[78vh] w-auto rounded-lg object-contain"
                priority
              />
              <figcaption className="text-sm text-cream/70">
                {images[lightbox].category} · {lightbox + 1} / {images.length}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
