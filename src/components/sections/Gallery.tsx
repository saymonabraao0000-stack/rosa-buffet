"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { galleryImages } from "@/lib/site-data";

// Grid pensado para futura integração com o feed do Instagram
// (@rosabuffetoficial_) — basta substituir `galleryImages` por
// dados vindos da API do Instagram mantendo a mesma estrutura.
export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="galeria" className="bg-gray-light py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Galeria"
          title="Momentos que já ganharam vida em nossos eventos."
          description="Uma amostra da sofisticação e do cuidado que aplicamos em cada celebração."
        />

        <div className="mt-16 grid auto-rows-[220px] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {galleryImages.map((image, index) => (
            <motion.button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (index % 8) * 0.05, ease: "easeOut" }}
              className={`focus-gold group relative overflow-hidden rounded-xl ${
                index % 5 === 0 ? "col-span-2 row-span-2" : ""
              }`}
              aria-label={`Ampliar imagem: ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/30" />
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/celebracoes"
            className="focus-gold inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-base font-semibold tracking-wide text-cream transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-soft"
          >
            Ver portfólio completo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </Container>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Visualização ampliada da imagem"
            onClick={() => setActiveIndex(null)}
          >
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              aria-label="Fechar imagem"
              className="focus-gold absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative aspect-[4/3] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={galleryImages[activeIndex].src}
                alt={galleryImages[activeIndex].alt}
                fill
                sizes="90vw"
                className="rounded-xl object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
