"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { heroImage } from "@/lib/site-data";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[540px] items-center overflow-hidden bg-ink lg:h-[600px] lg:min-h-0"
    >
      <Image
        src={heroImage}
        alt="Salão decorado pela Rosa Buffet para um evento elegante em Manaus"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/55" />
      <div className="absolute inset-0 bg-ink/25" />

      <Container className="relative z-10 flex h-full items-center pb-10 pt-24 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <h1 className="font-display text-3xl leading-[1.15] text-cream sm:text-4xl md:text-5xl lg:text-6xl">
            Transformamos celebrações em experiências inesquecíveis.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
            Buffet e produção de eventos em Manaus: estrutura completa,
            atendimento personalizado e excelência em cada detalhe.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <WhatsAppButton
              size="lg"
              label="Solicitar orçamento pelo WhatsApp"
            />
            <a
              href="#servicos"
              className="focus-gold inline-flex items-center justify-center rounded-full border border-cream/30 px-8 py-4 text-base font-semibold tracking-wide text-cream transition-all duration-300 hover:-translate-y-0.5 hover:bg-cream/10"
            >
              Conheça nossos serviços
            </a>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
