"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { siteConfig } from "@/lib/site-config";

export default function Location() {
  return (
    <section id="contato" className="bg-gray-light py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Localização"
          title="Venha nos conhecer em Manaus."
        />

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col justify-center gap-6 rounded-2xl bg-ink p-10 text-cream"
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
            <a
              href={siteConfig.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-gold inline-flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold tracking-wide text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-soft"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Como chegar
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-sm ring-1 ring-ink/5 lg:aspect-auto"
          >
            <iframe
              title={`Mapa de localização da ${siteConfig.name}`}
              src={siteConfig.googleMapsEmbedUrl}
              className="h-full min-h-[320px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
