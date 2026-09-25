"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { aboutImage } from "@/lib/site-data";

export default function About() {
  return (
    <section id="sobre" className="bg-cream py-14 sm:py-20">
      <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="reveal relative aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-2xl lg:aspect-[5/4]"
        >
          <Image
            src={aboutImage}
            alt="Noivos sorrindo em casamento realizado pela Rosa Buffet"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover object-[50%_30%]"
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
          <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
            A festa é sua. A Dona Rosa cuida do resto.
          </h2>
          <p className="text-base leading-relaxed text-gray-dark sm:text-lg">
            Rosilene Moreira, a Dona Rosa pra quem já foi cliente, comanda a
            Rosa Buffet ao lado do filho Wellington — negócio de família, do
            jeito que se cuida de festa de gente conhecida. Tudo acontece no
            salão próprio, na Rua São João, 310, Cidade de Deus, com buffet,
            decoração, cerimonial, foto e DJ inclusos.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
