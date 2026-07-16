/**
 * Configuração central do site.
 * Edite os valores abaixo para atualizar dados de contato, endereço,
 * números institucionais e links sociais em todo o site de uma só vez.
 */

export const siteConfig = {
  name: "Rosa Buffet",
  fullName: "Rosa Buffet & Eventos",
  tagline: "Buffet e Produção de Eventos em Manaus",
  description:
    "A Rosa Buffet é referência em buffet, decoração e produção de eventos em Manaus. Solicite seu orçamento pelo WhatsApp.",
  url: "https://www.rosabuffet.com.br",

  // TODO: substituir pelo número oficial de WhatsApp da empresa, caso mude.
  whatsappNumber: "5592992073047",
  whatsappDefaultMessage:
    "Olá! Gostaria de solicitar um orçamento para meu evento.",

  phoneDisplay: "(92) 99207-3047",

  email: "contato@rosabuffet.com.br",

  address: {
    street: "Rua São João, 310",
    neighborhood: "Cidade de Deus",
    city: "Manaus",
    state: "AM",
    full: "Rua São João, 310 - Cidade de Deus, Manaus - AM",
  },

  // TODO: substituir pelo link real do Google Maps do local do buffet.
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Rua+São+João+310+Cidade+de+Deus+Manaus+AM",
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=Rua+São+João,+310+-+Cidade+de+Deus,+Manaus+-+AM&output=embed",

  social: {
    instagram: "https://www.instagram.com/rosabuffetoficial_/",
    // TODO: substituir pelo Facebook oficial quando disponível.
    facebook: "https://www.facebook.com/",
  },

  // Números institucionais em destaque na seção "Sobre".
  // Fáceis de atualizar conforme a empresa evolui.
  stats: [
    { label: "Anos de experiência", value: 15, suffix: "+" },
    { label: "Eventos realizados", value: 800, suffix: "+" },
    { label: "Clientes satisfeitos", value: 1200, suffix: "+" },
    { label: "Profissionais especializados", value: 40, suffix: "+" },
  ],

  nav: [
    { label: "Início", href: "#inicio" },
    { label: "Sobre", href: "#sobre" },
    { label: "Serviços", href: "#servicos" },
    { label: "Celebrações", href: "/celebracoes" },
    { label: "Galeria", href: "#galeria" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "Contato", href: "#contato" },
  ],
} as const;

export function buildWhatsappUrl(message?: string) {
  const text = encodeURIComponent(message ?? siteConfig.whatsappDefaultMessage);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`;
}
