import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Calculator, ChevronDown, MapPin, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/SocialIcons";
import { buildWhatsappUrl, siteConfig, whatsappAttendants } from "@/lib/site-config";
import WhatsAppChoice from "@/components/ui/WhatsAppChoice";
import { festas } from "@/lib/festas-data";

// Rótulo curto no rodapé; o "em Manaus" já está no título da coluna.
const festaLabel = (h1: string) => h1.replace(/ em Manaus$/, "");

const institucional = [
  { label: "Sobre nós", href: "/sobre" },
  { label: "Serviços", href: "/servicos" },
  { label: "Pacotes", href: "/pacotes" },
  { label: "Fotos das festas", href: "/celebracoes" },
  { label: "Depoimentos", href: "/depoimentos" },
  { label: "Onde estamos", href: "/onde-estamos" },
];

const headingClass = "mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold sm:mb-5";
const summaryClass =
  "focus-gold flex cursor-pointer list-none items-center justify-between py-3.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold [&::-webkit-details-marker]:hidden";
const linkClass = "focus-gold transition-colors hover:text-gold";
const socialClass =
  "focus-gold flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 transition-colors hover:border-gold hover:text-gold";

export default function Footer() {
  const year = new Date().getFullYear();

  // As duas colunas de links. No celular viram sanfona (fechadas); do sm
  // para cima aparecem abertas como colunas. Um só conteúdo para os dois.
  const colunas = [
    {
      title: "Festas em Manaus",
      links: festas.map((festa) => ({ label: festaLabel(festa.h1), href: `/festas/${festa.slug}` })),
    },
    { title: "Rosa Buffet", links: institucional },
  ];
  const linkList = (links: { label: string; href: string }[]) => (
    <ul className="flex flex-col gap-3 text-sm text-cream/75">
      {links.map((item) => (
        <li key={item.href}>
          <a href={item.href} className={linkClass}>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <footer className="bg-ink text-cream">
      <Container>
        {/* Faixa de ação: os dois caminhos que viram cliente. */}
        <div className="flex flex-col items-start justify-between gap-5 border-b border-cream/10 py-8 sm:gap-6 sm:py-12 md:flex-row md:items-center">
          <div>
            <p className="font-display text-2xl sm:text-3xl">Vamos planejar a sua festa?</p>
            <p className="mt-2 text-sm text-cream/65">
              Simule o orçamento pelo site ou venha conhecer o salão pessoalmente.
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-row">
            <a
              href="/orcamento"
              className="focus-gold inline-flex items-center justify-center gap-2 rounded-full bg-gold px-3 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft sm:px-6"
            >
              <Calculator className="hidden h-4 w-4 sm:block" aria-hidden="true" />
              Simular orçamento
            </a>
            <a
              href="/visita"
              className="focus-gold inline-flex items-center justify-center gap-2 rounded-full border border-cream/25 px-3 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold sm:px-6"
            >
              <CalendarCheck className="hidden h-4 w-4 sm:block" aria-hidden="true" />
              Agendar visita
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 sm:gap-10 sm:py-14 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-4 sm:flex sm:flex-col sm:items-stretch sm:gap-5">
            <Image
              src="/images/logo-header.png"
              alt={siteConfig.name}
              width={900}
              height={235}
              className="h-10 w-auto self-start sm:h-12"
            />
            <p className="col-span-2 row-start-2 max-w-xs text-sm leading-relaxed text-cream/65">
              Buffet, decoração e produção de eventos em Manaus, com salão
              próprio e equipe do começo ao fim da festa.
            </p>
            <div className="col-start-2 row-start-1 flex items-center gap-2 sm:gap-3">
              <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram da Rosa Buffet" className={socialClass}>
                <InstagramIcon className="h-5 w-5" aria-hidden="true" />
              </a>
              <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook da Rosa Buffet" className={socialClass}>
                <FacebookIcon className="h-5 w-5" aria-hidden="true" />
              </a>
              <WhatsAppChoice
                ariaLabel="WhatsApp da Rosa Buffet"
                menuAlign="left"
                className={socialClass}
              >
                <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
              </WhatsAppChoice>
            </div>
          </div>

          {/* Celular: sanfona nativa, fechada por padrão. */}
          <div className="divide-y divide-cream/10 border-y border-cream/10 sm:hidden">
            {colunas.map((coluna) => (
              <nav key={coluna.title} aria-label={coluna.title}>
                <details className="group">
                  <summary className={summaryClass}>
                    {coluna.title}
                    <ChevronDown
                      className="h-4 w-4 transition-transform duration-300 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="pb-4">{linkList(coluna.links)}</div>
                </details>
              </nav>
            ))}
          </div>

          {/* Do sm para cima: colunas abertas, como sempre foram. */}
          {colunas.map((coluna) => (
            <nav key={coluna.title} aria-label={coluna.title} className="hidden sm:block">
              <h3 className={headingClass}>{coluna.title}</h3>
              {linkList(coluna.links)}
            </nav>
          ))}

          <div>
            <h3 className={headingClass}>Atendimento</h3>
            <ul className="flex flex-col gap-3 text-sm text-cream/75 sm:gap-4">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <div className="flex flex-col gap-2">
                  {whatsappAttendants.map((atendente) => (
                    <a
                      key={atendente.nome}
                      href={buildWhatsappUrl(undefined, atendente)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {atendente.nome} {atendente.phoneDisplay}
                    </a>
                  ))}
                  <span className="text-xs text-cream/50">WhatsApp</span>
                </div>
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
              {/* No celular a faixa de cima já tem "Agendar visita". */}
              <li className="hidden items-start gap-2.5 sm:flex">
                <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a href="/visita" className={linkClass}>
                  Visitas ao salão com hora marcada
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-cream/10 py-5 text-center sm:gap-3 sm:py-6 text-xs text-cream/50 sm:flex-row sm:justify-between">
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
