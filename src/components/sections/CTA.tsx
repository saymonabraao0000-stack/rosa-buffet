"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 sm:py-32">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <Container className="relative flex flex-col items-center gap-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-display text-3xl text-cream sm:text-4xl md:text-5xl"
        >
          Seu evento merece ser inesquecível.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg"
        >
          Nossa equipe está pronta para transformar sua ideia em uma
          celebração única.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <WhatsAppButton
            size="lg"
            label="Solicitar orçamento pelo WhatsApp"
            className="mt-2"
          />
        </motion.div>
      </Container>
    </section>
  );
}
