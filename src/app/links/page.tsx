import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { Calculator, CalendarCheck, ChevronRight, Gift, Globe, Images, MapPin, Star } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/SocialIcons";
import { buildWhatsappUrl, siteConfig, whatsappAttendants } from "@/lib/site-config";

// Página de links da bio do Instagram (@rosabuffetoficial_). Sem Navbar/Footer
// e sem o botão flutuante do WhatsApp (escondido em /links no
// WhatsAppFloatingButton). O simulador leva ?origem=instagram, então o lead
// cai no CRM com origem "Instagram" em vez de "Site".

const linksTitle = "Links";
const linksOgTitle = `${linksTitle} | ${siteConfig.name}`;
const linksDescription =
  "Todos os links da Rosa Buffet em um só lugar: simule o orçamento da sua festa, agende uma visita, fale no WhatsApp e veja pacotes e celebrações em Manaus.";

export const metadata: Metadata = {
  title: linksTitle,
  description: linksDescription,
  alternates: { canonical: "/links" },
  openGraph: {
    title: linksOgTitle,
    description: linksDescription,
    images: [{ url: "/images/eventos/hero-salao.jpg", width: 1672, height: 941 }],
  },
  twitter: {
    card: "summary_large_image",
    title: linksOgTitle,
    description: linksDescription,
    images: ["/images/eventos/hero-salao.jpg"],
  },
};

const linksWhatsappMessage = "Olá! Vim pelo Instagram e gostaria de um orçamento para a minha festa.";

const pacotes = [
  { label: "Pacote Premium", href: "/pacotes/premium?origem=instagram" },
  { label: "Pacote Gold", href: "/pacotes/gold?origem=instagram" },
  { label: "Pacote Kids", href: "/pacotes/kids?origem=instagram" },
];

export default function LinksPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-cream">
      <div className="absolute inset-x-0 top-0 h-[420px]">
        <Image
          src="/images/eventos/hero-salao.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/80 to-ink" />
      </div>

      <div className="relative mx-auto flex max-w-md flex-col items-center px-5 pt-14 pb-12">
        <h1 className="sr-only">{siteConfig.fullName} | Links</h1>
        <Image
          src="/images/logo-vertical.png"
          alt={siteConfig.fullName}
          width={1330}
          height={931}
          priority
          className="h-auto w-44"
        />
        <p className="mt-5 text-center text-sm leading-relaxed text-cream/75">
          Buffet, decoração e produção de festas em Manaus.
          <br />
          Casamentos, 15 anos, festas infantis e aniversários.
        </p>

        <nav aria-label="Links da Rosa Buffet" className="mt-9 flex w-full flex-col gap-3">
          <a
            href="/orcamento?origem=instagram"
            className="focus-gold group flex items-center gap-4 rounded-2xl bg-gold px-5 py-4 text-ink shadow-lg shadow-gold/15 transition-transform active:scale-[0.98]"
          >
            <Calculator className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span className="flex-1">
              <span className="block font-semibold">Simule o orçamento da sua festa</span>
              <span className="block text-sm text-ink/70">Leva 1 minuto e você já vê o valor</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>

          <LinkButton
            href="/visita?origem=instagram"
            icon={<CalendarCheck className="h-5 w-5" aria-hidden="true" />}
          >
            Agendar visita ao salão
          </LinkButton>

          {whatsappAttendants.map((atendente) => (
            <LinkButton
              key={atendente.nome}
              href={buildWhatsappUrl(linksWhatsappMessage, atendente)}
              external
              icon={<WhatsAppIcon className="h-5 w-5" aria-hidden="true" />}
            >
              Falar com {atendente.saudacao} no WhatsApp
            </LinkButton>
          ))}
          <LinkButton href="/celebracoes" icon={<Images className="h-5 w-5" aria-hidden="true" />}>
            Fotos das nossas festas
          </LinkButton>
          <LinkButton href="/#depoimentos" icon={<Star className="h-5 w-5" aria-hidden="true" />}>
            O que dizem nossos clientes
          </LinkButton>

          <p className="mt-4 mb-1 text-center text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Pacotes
          </p>
          {pacotes.map((pacote) => (
            <LinkButton
              key={pacote.href}
              href={pacote.href}
              icon={<Gift className="h-5 w-5" aria-hidden="true" />}
            >
              {pacote.label}
            </LinkButton>
          ))}

          <p className="mt-4 mb-1 text-center text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Visite a gente
          </p>
          <LinkButton href={siteConfig.googleMapsUrl} external icon={<MapPin className="h-5 w-5" aria-hidden="true" />}>
            Como chegar
          </LinkButton>
          <LinkButton href="/" icon={<Globe className="h-5 w-5" aria-hidden="true" />}>
            Nosso site
          </LinkButton>
        </nav>

        <div className="mt-10 flex flex-col items-center gap-3 text-center text-xs text-cream/50">
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-gold inline-flex items-center gap-2 text-cream/70 hover:text-gold"
          >
            <InstagramIcon className="h-4 w-4" aria-hidden="true" />
            @rosabuffetoficial_
          </a>
          <span>{siteConfig.address.full}</span>
          <span className="flex flex-col gap-0.5">
            {whatsappAttendants.map((atendente) => (
              <span key={atendente.nome}>
                {atendente.nome} {atendente.phoneDisplay}
              </span>
            ))}
          </span>
        </div>
      </div>
    </main>
  );
}

function LinkButton({
  href,
  icon,
  children,
  external,
  hint,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  external?: boolean;
  hint?: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="focus-gold group flex items-center gap-4 rounded-2xl border border-cream/15 bg-cream/5 px-5 py-4 backdrop-blur-sm transition-colors hover:border-gold/60 hover:bg-cream/10 active:scale-[0.98]"
    >
      <span className="text-gold">{icon}</span>
      <span className="flex-1 font-medium">{children}</span>
      {hint && <span className="text-xs text-cream/40">{hint}</span>}
      <ChevronRight className="h-5 w-5 shrink-0 text-cream/40 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </a>
  );
}
