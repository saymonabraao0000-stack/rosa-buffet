"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { portfolioAllImages } from "@/lib/portfolio-data";

export default function PortfolioHeader() {
  const total = portfolioAllImages.length;

  return (
    <section className="relative overflow-hidden bg-ink pb-16 pt-36 sm:pt-40">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <Container className="relative flex flex-col items-center gap-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-soft"
        >
          Portfólio de Celebrações
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
          className="max-w-3xl font-display text-4xl leading-tight text-cream sm:text-5xl md:text-6xl"
        >
          Cada festa, uma história.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="max-w-2xl text-base leading-relaxed text-cream/75 sm:text-lg"
        >
          Reunimos {total} momentos reais de celebrações que ganharam vida em
          nossos espaços — de 15 anos e casamentos a festas infantis e
          formaturas. Explore por tema e imagine a sua.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <WhatsAppButton size="lg" label="Quero uma festa assim" />
        </motion.div>
      </Container>
    </section>
  );
}
