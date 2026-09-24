import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";
import { partyPackages } from "@/lib/quiz-data";
import { getPacoteContent } from "@/lib/pacotes-data";
import { getSetting, getDefaultPrecos } from "@/lib/crm/settings";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const pacotesTitle = "Pacotes de Festa em Manaus";
const pacotesOgTitle = `${pacotesTitle} | ${siteConfig.name}`;
const pacotesDescription =
  "Conheça os pacotes fechados da Rosa Buffet em Manaus: Premium, Gold e Kids. Buffet, decoração, cerimonial, fotografia e DJ inclusos, com valor por convidados.";

export const metadata: Metadata = {
  title: pacotesTitle,
  description: pacotesDescription,
  alternates: { canonical: "/pacotes" },
  openGraph: {
    title: pacotesOgTitle,
    description: pacotesDescription,
    images: [{ url: "/images/eventos/hero-salao.jpg", width: 1672, height: 941 }],
  },
  twitter: {
    card: "summary_large_image",
    title: pacotesOgTitle,
    description: pacotesDescription,
    images: ["/images/eventos/hero-salao.jpg"],
  },
};

export default async function PacotesPage() {
  const precos = await getSetting("precos", getDefaultPrecos());

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-ink pb-14 pt-32 text-cream sm:pt-36">
          <Container>
            <h1 className="max-w-xl font-display text-4xl leading-[1.1] sm:text-5xl">
              Escolha o pacote da sua festa
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-cream/75">
              Três pacotes fechados, com buffet, decoração, cerimonial e
              estrutura completa inclusos. Sem cobrança avulsa por item.
            </p>
          </Container>
        </section>

        <section className="bg-cream py-14 sm:py-16">
          <Container>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {partyPackages.map((pkg) => {
                const content = getPacoteContent(pkg.slug);
                const pkgPrecos = precos[pkg.slug] ?? {
                  pricesByGuests: pkg.pricesByGuests,
                  note: pkg.note,
                };
                const prices = Object.values(pkgPrecos.pricesByGuests).filter(
                  (v): v is number => typeof v === "number",
                );
                const fromPrice = prices.length ? Math.min(...prices) : undefined;

                return (
                  <Link
                    key={pkg.slug}
                    href={`/pacotes/${pkg.slug}`}
                    className="focus-gold group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_10px_40px_-20px_rgba(13,13,13,0.25)] transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={content?.heroImage ?? "/images/eventos/hero-salao.jpg"}
                        alt={content?.heroAlt ?? pkg.label}
                        fill
                        sizes="(min-width: 640px) 33vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="font-display text-2xl text-ink">
                        Pacote {pkg.label}
                      </h2>
                      <p className="mt-1 text-sm text-ink/60">{pkg.tagline}</p>
                      <p className="mt-4 text-sm font-semibold text-gold">
                        {fromPrice != null
                          ? `A partir de ${currency.format(fromPrice)}`
                          : "Sob consulta"}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-transform group-hover:translate-x-0.5">
                        Ver pacote
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
