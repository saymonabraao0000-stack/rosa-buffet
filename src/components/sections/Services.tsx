"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { services } from "@/lib/site-data";

// Cada serviço aqui é um tipo de evento e leva direto para a página
// dedicada em /festas/[slug].
const festaSlugByService: Record<string, string> = {
  "festas-infantis": "buffet-infantil-manaus",
  casamentos: "buffet-para-casamento-manaus",
  "15-anos": "festa-de-15-anos-manaus",
  aniversarios: "festa-de-aniversario-manaus",
  formaturas: "festa-de-formatura-manaus",
};

export default function Services() {
  return (
    <section id="servicos" className="bg-cream py-14 sm:py-20">
      <Container>
        <SectionHeading
          title="Um tipo de festa para cada celebração."
          description="Escolha o evento e veja como cuidamos de cada detalhe."
        />

        <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-5">
          {services.map((service, index) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (index % 7) * 0.05, ease: "easeOut" }}
              className="w-[78%] flex-none snap-start sm:w-auto"
            >
              <Link
                href={`/festas/${festaSlugByService[service.slug]}`}
                className="focus-gold group relative block aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-lg"
              >
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(min-width: 1024px) 15vw, (min-width: 640px) 25vw, 78vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-3">
                  <span className="font-display text-sm leading-tight text-cream sm:text-base">
                    {service.title}
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 flex-none text-cream transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
