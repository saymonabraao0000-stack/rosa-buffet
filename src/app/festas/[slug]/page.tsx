import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { siteConfig } from "@/lib/site-config";
import { festas, getFesta, getPackageBySlug } from "@/lib/festas-data";
import { getPacoteContent } from "@/lib/pacotes-data";

type Params = { slug: string };

export function generateStaticParams() {
  return festas.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const festa = getFesta(slug);
  if (!festa) return {};

  return {
    title: festa.metaTitle,
    description: festa.metaDescription,
    alternates: { canonical: `/festas/${slug}` },
    openGraph: {
      title: festa.metaTitle,
      description: festa.metaDescription,
      images: [{ url: festa.heroImage }],
    },
  };
}

export default async function FestaPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const festa = getFesta(slug);
  if (!festa) notFound();

  const outrasFestas = festas.filter((f) => f.slug !== slug);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: festa.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Festas", item: `${siteConfig.url}/festas` },
      { "@type": "ListItem", position: 3, name: festa.h1, item: `${siteConfig.url}/festas/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative flex min-h-[480px] items-center overflow-hidden bg-ink lg:h-[560px] lg:min-h-0">
          <Image
            src={festa.heroImage}
            alt={festa.heroAlt}
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
                {festa.h1}
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-cream/80 sm:text-lg">
                {festa.intro[0]}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/orcamento"
                  className="focus-gold inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-semibold text-ink shadow-[0_8px_30px_-10px_rgba(201,162,39,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-soft"
                >
                  Simular minha festa
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/visita"
                  className="focus-gold inline-flex items-center justify-center gap-2 rounded-full border border-cream/40 px-8 py-4 text-base font-semibold text-cream transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:text-gold"
                >
                  Agendar visita ao salão
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* Como é a festa */}
        <section className="bg-cream py-16 sm:py-20">
          <Container>
            <h2 className="font-display text-3xl text-ink sm:text-4xl">
              {festa.introHeading}
            </h2>
            <div className="mt-6 flex max-w-3xl flex-col gap-4 text-base leading-relaxed text-ink/75">
              {/* o 1º parágrafo já aparece no hero; aqui vem o resto */}
              {(festa.intro.length > 1 ? festa.intro.slice(1) : festa.intro).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Container>
        </section>

        {/* Pacotes recomendados */}
        <section className="bg-ink py-16 text-cream sm:py-20">
          <Container>
            <h2 className="font-display text-3xl sm:text-4xl">Pacotes indicados</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {festa.packageSlugs.map((pkgSlug) => {
                const pkg = getPackageBySlug(pkgSlug);
                const content = getPacoteContent(pkgSlug);
                if (!pkg || !content) return null;
                return (
                  <Link
                    key={pkgSlug}
                    href={`/pacotes/${pkgSlug}`}
                    className="focus-gold group flex flex-col overflow-hidden rounded-2xl border border-cream/15 bg-cream/5 transition-colors hover:border-gold"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={content.heroImage}
                        alt={content.heroAlt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h3 className="font-display text-xl text-cream">Pacote {pkg.label}</h3>
                      <p className="text-sm leading-relaxed text-cream/70">{pkg.tagline}</p>
                      <span className="focus-gold mt-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold transition-colors group-hover:text-gold-soft">
                        Ver pacote completo
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Galeria */}
        {festa.gallery.length > 0 && (
          <section className="bg-cream py-16 sm:py-20">
            <Container>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">
                Como fica na prática
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {festa.gallery.map((photo) => (
                  <div
                    key={photo.src}
                    className="relative aspect-[3/4] overflow-hidden rounded-xl"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* FAQ */}
        <section className="bg-ink-soft py-16 text-cream sm:py-20">
          <Container>
            <h2 className="font-display text-3xl sm:text-4xl">Perguntas frequentes</h2>
            <div className="mt-10 flex max-w-3xl flex-col gap-6">
              {festa.faq.map((item) => (
                <div key={item.question} className="border-b border-cream/10 pb-6">
                  <h3 className="flex items-start gap-2 font-display text-lg text-cream">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                    {item.question}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/70">{item.answer}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Veja também */}
        <section className="bg-cream py-16 sm:py-20">
          <Container>
            <h2 className="font-display text-3xl text-ink sm:text-4xl">Veja também</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {outrasFestas.map((f) => (
                <Link
                  key={f.slug}
                  href={`/festas/${f.slug}`}
                  className="focus-gold rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink/80 transition-colors hover:border-gold hover:text-gold"
                >
                  {f.h1}
                </Link>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA final */}
        <section className="bg-ink py-16 text-center text-cream sm:py-20">
          <Container>
            <h2 className="font-display text-3xl sm:text-4xl">
              Pronto pra planejar sua festa?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-cream/75">
              Simule o valor pelo site ou fale com a nossa equipe pelo WhatsApp
              para confirmar disponibilidade.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/orcamento"
                className="focus-gold inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-semibold text-ink shadow-[0_8px_30px_-10px_rgba(201,162,39,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-soft"
              >
                Simular minha festa
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <WhatsAppButton
                variant="outline-light"
                size="lg"
                label="Falar no WhatsApp"
                message={`Olá! Tenho interesse em ${festa.h1.toLowerCase()}.`}
              />
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
