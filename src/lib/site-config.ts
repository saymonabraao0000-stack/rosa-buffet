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

  // Número institucional (Rosa/Rosilene) — usado em JSON-LD, PDF do
  // orçamento e no CRM. NÃO é mais o único que atende no site: o site
  // público oferece Rosa e Wellington como escolha (ver `whatsappAttendants`
  // e `buildWhatsappUrl` abaixo). Decisão de 2026-09-25.
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

// Os dois atendentes que recebem clientes pelo WhatsApp do site público
// (decisão de 2026-09-25, para acabar com o impasse entre os dois números).
// Rosa é o padrão de `buildWhatsappUrl` para não quebrar quem chama sem
// atendente. CRM, PDFs e JSON-LD continuam com `siteConfig.whatsappNumber`
// (o da Rosa) — não usam essa lista.
export const whatsappAttendants = [
  { nome: "Rosa", saudacao: "a Rosa", telefone: "5592992073047", phoneDisplay: "(92) 99207-3047" },
  { nome: "Wellington", saudacao: "o Wellington", telefone: "5592994598954", phoneDisplay: "(92) 99459-8954" },
] as const;

export type WhatsappAttendant = (typeof whatsappAttendants)[number];

export function buildWhatsappUrl(
  message?: string,
  atendente: WhatsappAttendant = whatsappAttendants[0],
) {
  const text = encodeURIComponent(message ?? siteConfig.whatsappDefaultMessage);
  return `https://wa.me/${atendente.telefone}?text=${text}`;
}
