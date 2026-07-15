"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { differentiators } from "@/lib/site-data";

export default function Differentiators() {
  return (
    <section className="bg-gray-light py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Nossos diferenciais"
          title="Excelência em cada detalhe do seu evento."
          description="Uma estrutura completa pensada para que você viva o seu evento sem preocupações."
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {differentiators.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: "easeOut" }}
                className="group flex flex-col gap-4 rounded-2xl border border-ink/5 bg-cream p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-ink">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="font-display text-xl text-ink">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-dark">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
