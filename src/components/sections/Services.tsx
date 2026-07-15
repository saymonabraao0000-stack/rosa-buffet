"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { buildWhatsappUrl } from "@/lib/site-config";
import { services } from "@/lib/site-data";

export default function Services() {
  return (
    <section id="servicos" className="bg-cream py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Nossos serviços"
          title="Soluções completas para cada tipo de celebração."
          description="Do planejamento à execução, cuidamos de cada detalhe para que seu evento seja perfeito."
        />

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.article
              key={service.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.1, ease: "easeOut" }}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
              </div>

              <div className="flex flex-1 flex-col gap-3 p-6">
                <h3 className="font-display text-xl text-ink">{service.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-gray-dark">
                  {service.description}
                </p>
                <a
                  href={buildWhatsappUrl(
                    `Olá! Gostaria de solicitar um orçamento para ${service.title}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-gold mt-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold transition-colors hover:text-ink"
                >
                  Solicitar orçamento
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
