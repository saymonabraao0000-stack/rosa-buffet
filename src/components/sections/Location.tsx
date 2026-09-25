"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarCheck, MapPin, Navigation } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { siteConfig } from "@/lib/site-config";

/**
 * Na home o mapa só carrega no toque (ver comentário abaixo). Na página
 * /onde-estamos o mapa é o assunto da página, então abre direto e o título
 * da seção sai (o h1 da página já diz o mesmo).
 */
export default function Location({ standalone = false }: { standalone?: boolean }) {
  const [showMap, setShowMap] = useState(standalone);

  return (
    <section id="contato" className="bg-gray-light py-14 sm:py-16">
      <Container>
        {!standalone && <SectionHeading title="Venha nos conhecer em Manaus." />}

        <div className={`${standalone ? "" : "mt-10 "}grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8`}>
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="reveal flex flex-col justify-center gap-5 rounded-2xl bg-ink p-7 text-cream sm:gap-6 sm:p-10"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
              <MapPin className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-display text-2xl">{siteConfig.address.city} - {siteConfig.address.state}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/75">
                {siteConfig.address.full}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-cream/75">
              Quer ver o salão antes de fechar? Escolha o dia e o horário e
              nossa equipe te recebe pessoalmente.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/visita"
                className="focus-gold inline-flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold tracking-wide text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-soft"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Agendar visita ao salão
              </a>
              <a
                href={siteConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-gold inline-flex w-fit items-center gap-2 rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold tracking-wide text-cream transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Como chegar
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="reveal relative aspect-video w-full overflow-hidden rounded-2xl shadow-sm ring-1 ring-ink/5 lg:aspect-auto"
          >
            {showMap ? (
              <iframe
                title={`Mapa de localização da ${siteConfig.name}`}
                src={siteConfig.googleMapsEmbedUrl}
                className="h-full min-h-[320px] w-full border-0"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              // O mapa do Google só carrega no toque: o embed roda JS pesado
              // que, no celular, disputava a thread principal com as animações
              // da página e causava travadas no fim delas (medido em 2026-09-23).
              // Enquanto isso, a caixa mostra o salão com o botão por cima.
              <button
                type="button"
                onClick={() => setShowMap(true)}
                aria-label={`Ver mapa: ${siteConfig.address.neighborhood}, ${siteConfig.address.city}`}
                className="focus-gold group absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 text-cream"
              >
                <Image
                  src="/images/portfolio/quinze-anos/quinze-anos-27.jpg"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-ink/60 transition-colors duration-300 group-hover:bg-ink/50" aria-hidden="true" />
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gold text-ink transition-transform duration-300 group-hover:scale-105">
                  <MapPin className="h-7 w-7" aria-hidden="true" />
                </span>
                <span className="relative font-display text-xl">Ver mapa</span>
                <span className="relative text-sm text-cream/80">{siteConfig.address.neighborhood}, {siteConfig.address.city}</span>
              </button>
            )}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
