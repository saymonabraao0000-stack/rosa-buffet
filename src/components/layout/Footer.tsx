import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Calculator, MapPin, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/SocialIcons";
import { buildWhatsappUrl, siteConfig } from "@/lib/site-config";
import { festas } from "@/lib/festas-data";

// Rótulo curto no rodapé; o "em Manaus" já está no título da coluna.
const festaLabel = (h1: string) => h1.replace(/ em Manaus$/, "");

const institucional = [
  { label: "Sobre nós", href: "/#sobre" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Pacotes", href: "/pacotes" },
  { label: "Fotos das festas", href: "/celebracoes" },
  { label: "Depoimentos", href: "/#depoimentos" },
  { label: "Onde estamos", href: "/#contato" },
];

const headingClass = "mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-gold";
const linkClass = "focus-gold transition-colors hover:text-gold";
const socialClass =
  "focus-gold flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 transition-colors hover:border-gold hover:text-gold";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-cream">
      <Container>
        {/* Faixa de ação: os dois caminhos que viram cliente. */}
        <div className="flex flex-col items-start justify-between gap-6 border-b border-cream/10 py-12 md:flex-row md:items-center">
          <div>
            <p className="font-display text-2xl sm:text-3xl">Vamos planejar a sua festa?</p>
            <p className="mt-2 text-sm text-cream/65">
              Simule o orçamento pelo site ou venha conhecer o salão pessoalmente.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href="/orcamento"
              className="focus-gold inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
            >
              <Calculator className="h-4 w-4" aria-hidden="true" />
              Simular orçamento
            </a>
            <a
              href="/visita"
              className="focus-gold inline-flex items-center justify-center gap-2 rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              Agendar visita
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-5">
            <Image
              src="/images/logo-header.png"
              alt={siteConfig.name}
              width={900}
              height={235}
              className="h-12 w-auto self-start"
            />
            <p className="max-w-xs text-sm leading-relaxed text-cream/65">
              Buffet, decoração e produção de eventos em Manaus, com salão
              próprio e equipe do começo ao fim da festa.
            </p>
            <div className="flex items-center gap-3">
              <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram da Rosa Buffet" className={socialClass}>
                <InstagramIcon className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook da Rosa Buffet" className={socialClass}>
                <FacebookIcon className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href={buildWhatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp da Rosa Buffet" className={socialClass}>
                <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav aria-label="Festas em Manaus">
            <h3 className={headingClass}>Festas em Manaus</h3>
            <ul className="flex flex-col gap-3 text-sm text-cream/75">
              {festas.map((festa) => (
                <li key={festa.slug}>
                  <a href={`/festas/${festa.slug}`} className={linkClass}>
                    {festaLabel(festa.h1)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Rosa Buffet">
            <h3 className={headingClass}>Rosa Buffet</h3>
            <ul className="flex flex-col gap-3 text-sm text-cream/75">
              {institucional.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={linkClass}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className={headingClass}>Atendimento</h3>
            <ul className="flex flex-col gap-4 text-sm text-cream/75">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a href={buildWhatsappUrl()} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {siteConfig.phoneDisplay}
                  <span className="block text-xs text-cream/50">WhatsApp</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span>
                  {siteConfig.address.street}
                  <span className="block">
                    {siteConfig.address.neighborhood}, {siteConfig.address.city} - {siteConfig.address.state}
                  </span>
                  <a
                    href={siteConfig.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-gold mt-1 inline-block text-xs text-gold underline-offset-2 hover:underline"
                  >
                    Como chegar
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a href="/visita" className={linkClass}>
                  Visitas ao salão com hora marcada
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-cream/10 py-6 text-center text-xs text-cream/50 sm:flex-row sm:justify-between">
          <span>
            © {year} {siteConfig.fullName}. Todos os direitos reservados.
          </span>
          <div className="flex items-center gap-5">
            <Link href="/festas" className={linkClass}>
              Todas as festas
            </Link>
            <a href="/privacidade" className={linkClass}>
              Política de Privacidade
            </a>
            {/* Atalho da equipe para o CRM interno (fora da nav pública de propósito). */}
            <a href="/crm" rel="nofollow" className={linkClass}>
              Área restrita
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
