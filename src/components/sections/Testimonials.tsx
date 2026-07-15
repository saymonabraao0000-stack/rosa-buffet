"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/site-data";

// NOTA: os depoimentos abaixo são fictícios e servem apenas para
// demonstração de layout. Substituir por depoimentos reais de
// clientes da Rosa Buffet antes de publicar em produção.
export default function Testimonials() {
  return (
    <section id="depoimentos" className="bg-ink py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Depoimentos"
          title="Quem viveu, recomenda."
          light
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, index) => (
            <motion.figure
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (index % 4) * 0.1, ease: "easeOut" }}
              className="flex flex-col gap-5 rounded-2xl border border-cream/10 bg-cream/[0.04] p-7"
            >
              <div className="flex gap-1" aria-hidden="true">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-cream/85">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-soft font-display text-sm text-ink"
                  aria-hidden="true"
                >
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-cream">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-cream/60">{testimonial.city}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
