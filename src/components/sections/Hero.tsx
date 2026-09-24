"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Container from "@/components/ui/Container";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import GoogleRating from "@/components/ui/GoogleRating";
import { heroImage } from "@/lib/site-data";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[560px] items-center overflow-hidden bg-ink lg:h-[600px] lg:min-h-0"
    >
      <Image
        src={heroImage}
        alt="Salão decorado pela Rosa Buffet para um evento elegante em Manaus"
        fill
        priority
        sizes="100vw"
        quality={85}
        className="object-cover object-[78%_38%] lg:object-[64%_32%]"
      />

      {/* Degradê principal: reforçado na faixa do texto, some antes do bolo (x≈800-950) */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-ink/85 via-ink/60 via-[38%] to-transparent to-[55%] lg:block" />
      {/* Mobile: foto mais escura, overlay mais leve pra não lavar o bolo */}
      <div className="absolute inset-0 bg-ink/40 lg:hidden" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/50 to-ink/35 lg:hidden" />
      {/* Faixa no topo pra navbar transparente ficar legível mesmo sobre os lustres acesos */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/75 to-transparent lg:h-36" />

      <Container className="relative z-10 flex h-full items-center pb-10 pt-28 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="reveal max-w-[520px] lg:max-w-[560px]"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Manaus · AM
          </div>

          <h1 className="mt-4 font-display text-4xl leading-[1.1] text-cream sm:text-5xl lg:text-5xl">
            Festas inesquecíveis,
            <br />
            com tudo incluso.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-cream/80 sm:text-lg">
            Buffet, decoração, cerimonial, fotografia e DJ em um só pacote,
            no nosso salão em Manaus.
          </p>

          <div className="mt-8 flex flex-col items-start gap-5">
            <WhatsAppButton
              size="lg"
              label="Solicitar orçamento"
            />
            <GoogleRating />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
