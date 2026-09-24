import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";
import { festas } from "@/lib/festas-data";

export const metadata: Metadata = {
  title: `Festas em Manaus | ${siteConfig.name}`,
  description:
    "Conheça os tipos de festa que a Rosa Buffet organiza em Manaus: 15 anos, casamento, aniversário, formatura, festa infantil, evento corporativo e chá revelação.",
  alternates: { canonical: "/festas" },
};

export default function FestasIndexPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Festas", item: `${siteConfig.url}/festas` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main>
        <section className="relative flex min-h-[380px] items-center overflow-hidden bg-ink lg:h-[460px] lg:min-h-0">
          <Image
            src="/images/eventos/hero-salao.jpg"
            alt="Salão da Rosa Buffet montado com mesas e lustre"
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/25" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/75 to-transparent lg:h-36" />

          <Container className="relative z-10 flex h-full items-center pb-10 pt-28 sm:pt-32">
            <div className="max-w-[600px]">
              <h1 className="font-display text-4xl leading-[1.1] text-cream sm:text-5xl">
                Festas na <span className="text-gold">Rosa Buffet</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-cream/80 sm:text-lg">
                Do 15 anos ao chá revelação, cada tipo de festa tem um jeito
                próprio de acontecer no nosso salão, na Cidade de Deus, em
                Manaus.
              </p>
            </div>
          </Container>
        </section>

        <section className="bg-cream py-16 sm:py-20">
          <Container>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {festas.map((festa) => (
                <Link
                  key={festa.slug}
                  href={`/festas/${festa.slug}`}
                  className="focus-gold group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={festa.heroImage}
                      alt={festa.heroAlt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h2 className="font-display text-xl text-ink">{festa.h1}</h2>
                    <p className="flex-1 text-sm leading-relaxed text-gray-dark">
                      {festa.intro[0]}
                    </p>
                    <span className="focus-gold mt-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold transition-colors group-hover:text-ink">
                      Ver detalhes
                      <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
