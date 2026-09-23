"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { aboutImage } from "@/lib/site-data";

export default function About() {
  return (
    <section id="sobre" className="bg-cream py-24 sm:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="reveal relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-2xl"
        >
          <Image
            src={aboutImage}
            alt="Mesa de evento decorada com sofisticação pela Rosa Buffet"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold/20" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="reveal flex flex-col gap-5"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Sobre a Rosa Buffet
          </span>
          <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
            A tradição de transformar sonhos em grandes celebrações.
          </h2>
          <p className="text-base leading-relaxed text-gray-dark sm:text-lg">
            A Rosa Buffet é referência em organização, produção e
            realização de eventos em Manaus. Com estrutura própria, equipe
            especializada e compromisso com a excelência, cada evento é
            planejado cuidadosamente para proporcionar experiências
            memoráveis e surpreender clientes e convidados.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
