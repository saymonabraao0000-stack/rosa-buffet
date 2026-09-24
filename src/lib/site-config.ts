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
    "A Rosa Buffet é referência em buffet e produção de eventos em Manaus-AM: casamentos, 15 anos e festas infantis. Simule o orçamento no site ou fale no WhatsApp.",
  url: "https://rosabuffeteventos.com.br",

  // TODO: substituir pelo número oficial de WhatsApp da empresa, caso mude.
  whatsappNumber: "5592992073047",
  whatsappDefaultMessage:
    "Olá! Gostaria de solicitar um orçamento para meu evento.",

  phoneDisplay: "(92) 99207-3047",


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

  // Nota e número de avaliações do Perfil da Empresa no Google ("Rosa Buffet
  // Eventos"). Atualizar à mão de tempos em tempos. Conferido em 2026-09-24.
  // TODO: trocar `url` pelo link direto das avaliações quando houver acesso
  // de administrador ao perfil.
  googleReviews: {
    rating: 4.6,
    count: 266,
    url: "https://www.google.com/maps/search/?api=1&query=Rosa+Buffet+Eventos+R.+S%C3%A3o+Jo%C3%A3o+310+Cidade+de+Deus+Manaus",
  },

  social: {
    instagram: "https://www.instagram.com/rosabuffetoficial_/",
    facebook: "https://www.facebook.com/rosa.buffet.77",
  },

  nav: [
    { label: "Início", href: "#inicio" },
    { label: "Sobre", href: "#sobre" },
    { label: "Serviços", href: "#servicos" },
    { label: "Celebrações", href: "/celebracoes" },
    { label: "Simulador", href: "/orcamento" },
    { label: "Contato", href: "#contato" },
  ],
} as const;

export function buildWhatsappUrl(message?: string) {
  const text = encodeURIComponent(message ?? siteConfig.whatsappDefaultMessage);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`;
}
