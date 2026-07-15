"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { heroImage } from "@/lib/site-data";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden bg-ink"
    >
      <Image
        src={heroImage}
        alt="Salão decorado pela Rosa Buffet para um evento elegante em Manaus"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
      <div className="absolute inset-0 bg-ink/20" />

      <Container className="relative z-10 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <span className="mb-6 inline-block text-xs font-semibold uppercase tracking-[0.35em] text-gold-soft">
            Buffet &amp; Produção de Eventos em Manaus
          </span>
          <h1 className="font-display text-4xl leading-[1.15] text-cream sm:text-5xl md:text-6xl lg:text-7xl">
            Transformamos celebrações em experiências inesquecíveis.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
            Há anos realizando eventos memoráveis em Manaus, oferecendo
            estrutura completa, atendimento personalizado e excelência em
            cada detalhe.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
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

      <motion.a
        href="#sobre"
        aria-label="Rolar para a próxima seção"
        className="focus-gold absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-cream/70 transition-colors hover:text-gold"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-8 w-8" aria-hidden="true" />
      </motion.a>
    </section>
  );
}
