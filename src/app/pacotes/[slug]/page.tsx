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
import { guestOptions, partyPackages } from "@/lib/quiz-data";
import { getPacoteContent } from "@/lib/pacotes-data";
import { getSetting, getDefaultPrecos } from "@/lib/crm/settings";

export const dynamic = "force-dynamic";

const GUEST_BRACKETS = guestOptions
  .map((g) => g.guests)
  .filter((g): g is number => g != null);

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type Params = { slug: string };

function getPackage(slug: string) {
  return partyPackages.find((p) => p.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackage(slug);
  const content = getPacoteContent(slug);
  if (!pkg || !content) return {};

  const title = `Pacote ${pkg.label} em Manaus`;
  const ogTitle = `${title} | ${siteConfig.name}`;
  const image = {
    url: content.heroImage,
    width: content.heroImageWidth,
    height: content.heroImageHeight,
  };
  return {
    title,
    description: content.metaDescription,
    alternates: { canonical: `/pacotes/${slug}` },
    openGraph: {
      title: ogTitle,
      description: content.metaDescription,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: content.metaDescription,
      images: [content.heroImage],
    },
  };
}

export default async function PacotePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ origem?: string }>;
}) {
  const { slug } = await params;
  const { origem } = await searchParams;

  const pkg = getPackage(slug);
  const content = getPacoteContent(slug);
  if (!pkg || !content) notFound();

  const precos = await getSetting("precos", getDefaultPrecos());
  const pkgPrecos = precos[slug] ?? { pricesByGuests: pkg.pricesByGuests, note: pkg.note };

  const orcamentoHref = origem
    ? `/orcamento?origem=${encodeURIComponent(origem)}`
    : "/orcamento";

  const parcelaNote = pkgPrecos.note?.toLowerCase().includes("parcel")
    ? pkgPrecos.note
    : undefined;

  const outrosPacotes = partyPackages.filter((p) => p.slug !== slug);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative flex min-h-[520px] items-center overflow-hidden bg-ink lg:h-[600px] lg:min-h-0">
          <Image
            src={content.heroImage}
            alt={content.heroAlt}
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/25" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/75 to-transparent lg:h-36" />

          <Container className="relative z-10 flex h-full items-center pb-10 pt-28 sm:pt-32">
            <div className="max-w-[560px]">
              <h1 className="font-display text-4xl leading-[1.1] text-cream sm:text-5xl">
                Pacote <span className="text-gold">{pkg.label}</span>
              </h1>
              <p className="mt-3 font-display text-xl italic text-cream/90 sm:text-2xl">{pkg.tagline}</p>
              <p className="mt-5 max-w-md text-base leading-relaxed text-cream/80 sm:text-lg">
                {pkg.highlights[0]}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={orcamentoHref}
                  className="focus-gold inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-semibold text-ink shadow-[0_8px_30px_-10px_rgba(201,162,39,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-soft"
                >
                  Simular minha festa
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <WhatsAppButton
                  variant="outline-light"
                  size="lg"
                  label="Falar no WhatsApp"
                  message={`Olá! Tenho interesse no Pacote ${pkg.label}.`}
                />
              </div>
            </div>
          </Container>
        </section>

        {/* O que está incluso */}
        <section className="bg-cream py-16 sm:py-20">
          <Container>
            <h2 className="font-display text-3xl text-ink sm:text-4xl">
              O que está incluso
            </h2>
            <p className="mt-3 max-w-2xl text-base text-ink/70">
              Pacote fechado: os itens abaixo já vêm inclusos, sem cobrança
              avulsa por item.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {content.groups.map((group) => (
                <div key={group.title}>
                  <h3 className="font-display text-lg text-ink">{group.title}</h3>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/75">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Valores */}
        <section className="bg-ink py-16 text-cream sm:py-20">
          <Container>
            <h2 className="font-display text-3xl sm:text-4xl">
              Valores por quantidade de convidados
            </h2>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {GUEST_BRACKETS.map((guests) => {
                const price = pkgPrecos.pricesByGuests[guests];
                return (
                  <div
                    key={guests}
                    className="rounded-2xl border border-cream/15 bg-cream/5 p-5 text-center"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">
                      {guests} convidados
                    </p>
                    <p className="mt-2 font-display text-2xl text-cream">
                      {price != null ? currency.format(price) : "Sob consulta"}
                    </p>
                  </div>
                );
              })}
            </div>

            {pkgPrecos.note && (
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-cream/60">
                {pkgPrecos.note}
              </p>
            )}
            {parcelaNote && (
              <p className="mt-2 text-sm font-medium text-gold">{parcelaNote}</p>
            )}
          </Container>
        </section>

        {/* Galeria */}
        <section className="bg-cream py-16 sm:py-20">
          <Container>
            <h2 className="font-display text-3xl text-ink sm:text-4xl">
              Como fica na prática
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {content.gallery.map((photo) => (
                <div
                  key={photo.src}
                  className="relative aspect-[3/4] overflow-hidden rounded-xl"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 640px) 25vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA final */}
        <section className="bg-ink-soft py-16 text-center text-cream sm:py-20">
          <Container>
            <h2 className="font-display text-3xl sm:text-4xl">
              Pronto pra reservar sua data?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-cream/75">
              Fale com a nossa equipe pelo WhatsApp pra confirmar
              disponibilidade e dar o próximo passo.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={orcamentoHref}
                className="focus-gold inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-semibold text-ink shadow-[0_8px_30px_-10px_rgba(201,162,39,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-soft"
              >
                Simular minha festa
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <WhatsAppButton
                variant="outline-light"
                size="lg"
                label="Falar no WhatsApp"
                message={`Olá! Tenho interesse no Pacote ${pkg.label}.`}
              />
              <Link
                href={`/visita${origem ? `?origem=${encodeURIComponent(origem)}` : ""}`}
                className="focus-gold inline-flex items-center justify-center gap-2 rounded-full border border-cream/40 px-8 py-4 text-base font-semibold text-cream transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:text-gold"
              >
                Agendar visita ao salão
              </Link>
            </div>

            <div className="mx-auto mt-10 flex max-w-md flex-wrap items-center justify-center gap-3 text-sm">
              <span className="text-cream/50">Conheça também</span>
              {outrosPacotes.map((p) => (
                <Link
                  key={p.slug}
                  href={`/pacotes/${p.slug}${origem ? `?origem=${encodeURIComponent(origem)}` : ""}`}
                  className="focus-gold rounded-full border border-cream/20 px-4 py-1.5 font-medium text-cream/85 transition-colors hover:border-gold hover:text-gold"
                >
                  Pacote {p.label}
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

export function generateStaticParams() {
  return partyPackages.map((p) => ({ slug: p.slug }));
}
