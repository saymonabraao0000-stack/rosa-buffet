import Image from "next/image";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon } from "@/components/ui/SocialIcons";
import { buildWhatsappUrl, siteConfig } from "@/lib/site-config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink pt-20 text-cream">
      <Container>
        <div className="grid grid-cols-1 gap-12 pb-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.jpg"
                alt={siteConfig.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="font-display text-lg">{siteConfig.name}</span>
            </div>
            <p className="text-sm leading-relaxed text-cream/65">
              Referência em buffet, decoração e produção de eventos em
              Manaus, transformando celebrações em experiências
              inesquecíveis.
            </p>
          </div>

          <nav aria-label="Menu rápido do rodapé">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Menu rápido
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-cream/75">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="focus-gold transition-colors hover:text-gold">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Contato
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-cream/75">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span>{siteConfig.address.full}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a href={buildWhatsappUrl()} target="_blank" rel="noopener noreferrer" className="focus-gold transition-colors hover:text-gold">
                  {siteConfig.phoneDisplay}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Redes sociais
            </h3>
            <div className="flex items-center gap-3">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Rosa Buffet"
                className="focus-gold flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 transition-colors hover:border-gold hover:text-gold"
              >
                <InstagramIcon className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook da Rosa Buffet"
                className="focus-gold flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 transition-colors hover:border-gold hover:text-gold"
              >
                <FacebookIcon className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={buildWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp da Rosa Buffet"
                className="focus-gold flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 transition-colors hover:border-gold hover:text-gold"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/10 py-6 text-center text-xs text-cream/50">
          © {year} {siteConfig.fullName}. Todos os direitos reservados.
        </div>
      </Container>
    </footer>
  );
}
