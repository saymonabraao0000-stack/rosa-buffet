"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { processSteps } from "@/lib/site-data";

export default function Process() {
  return (
    <section className="bg-cream py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow="Processo" title="Como funciona." />

        <div className="relative mx-auto mt-16 max-w-2xl">
          <div
            className="absolute left-6 top-2 h-[calc(100%-2rem)] w-px bg-gold/25"
            aria-hidden="true"
          />

          <ol className="flex flex-col gap-12">
            {processSteps.map((step, index) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative flex items-start gap-6"
              >
                <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg text-gold ring-4 ring-cream">
                  {index + 1}
                </span>
                <div className="pt-2">
                  <h3 className="font-display text-xl text-ink sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-dark sm:text-base">
                    {step.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
