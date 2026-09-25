"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { pacoteItems } from "@/lib/site-data";

export default function Differentiators() {
  return (
    <section className="bg-gray-light py-14 sm:py-20">
      <Container>
        <SectionHeading title="Tudo o que a sua festa precisa, num pacote só." />

        {/* Celular: carrossel horizontal com scroll-snap (sangra até a borda
            da tela, o próximo item aparece pela metade); tablet: 2 colunas;
            desktop: 5 colunas com divisória. */}
        <div className="-mx-6 mt-8 flex snap-x snap-mandatory scroll-px-6 gap-5 overflow-x-auto px-6 [scrollbar-width:none] sm:mx-0 sm:mt-12 sm:grid sm:grid-cols-2 sm:gap-x-0 sm:gap-y-8 sm:overflow-visible sm:px-0 lg:grid-cols-5 lg:gap-y-0 lg:divide-x lg:divide-ink/10 [&::-webkit-scrollbar]:hidden">
          {pacoteItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
              className="reveal flex w-[78%] shrink-0 snap-start flex-col gap-2 border-l border-gold/40 pl-5 sm:w-auto sm:border-l-0 sm:px-6 lg:first:pl-0"
            >
              <span className="font-display text-2xl text-ink">
                0{index + 1}. {item.title}
              </span>
              <p className="text-sm leading-relaxed text-gray-dark">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/orcamento"
            className="text-sm font-medium text-ink underline decoration-gold/60 underline-offset-4 transition-colors hover:text-gold"
          >
            Ver pacotes e simular valor
          </Link>
        </div>
      </Container>
    </section>
  );
}
