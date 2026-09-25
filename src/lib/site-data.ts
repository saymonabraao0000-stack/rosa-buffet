/**
 * Todas as imagens abaixo são fotos REAIS de eventos realizados pela
 * Rosa Buffet, vindas de /public/images/eventos/ e /public/images/portfolio/.
 */

// Foto real: vista ampla do salão próprio da Rosa Buffet, com mesas e lustre.
export const heroImage = "/images/eventos/hero-salao.jpg";

// Foto real: casamento realizado pela Rosa Buffet.
export const aboutImage = "/images/eventos/casamento-noivos.jpg";

/**
 * Bloco "O que vem no pacote" — 5 itens que sustentam a promessa do hero
 * ("Buffet, decoração, cerimonial, fotografia e DJ em um só pacote").
 * Fatos vindos de src/lib/pacotes-data.ts (Pacote Premium) e festas-data.ts.
 */
export type PacoteItem = {
  title: string;
  description: string;
};

export const pacoteItems: PacoteItem[] = [
  {
    title: "Buffet",
    description:
      "Pratos quentes e acompanhamentos, refrigerantes e sucos, sobremesa e salgados fritos na hora, com louça completa, garçons e copeiro.",
  },
  {
    title: "Decoração",
    description:
      "Salão climatizado com mesa imperial dourada, mesa dos doces, cadeira Tiffany, lustres e passarela, camarim e segurança para os carros.",
  },
  {
    title: "Cerimonial",
    description:
      "Reunião presencial e organização completa do evento, do planejamento ao último convidado deixar o salão.",
  },
  {
    title: "Fotografia",
    description:
      "Cobertura fotográfica de todo o evento, com cabine fotográfica 360 e túnel fotográfico inclusos.",
  },
  {
    title: "DJ",
    description:
      "Estrutura completa de som e iluminação, com caixa de som, microfone sem fio e iluminação moving.",
  },
];

export type Service = {
  slug: string;
  title: string;
  description: string;
  image: string;
};

export const services: Service[] = [
  {
    slug: "festas-infantis",
    title: "Festas Infantis",
    description:
      "Celebrações encantadoras e sofisticadas, com decoração exclusiva e atenção a cada detalhe.",
    // Foto real: decoração temática de festa infantil.
    image: "/images/portfolio/infantil/infantil-01.jpg",
  },
  {
    slug: "casamentos",
    title: "Casamentos",
    description:
      "Cerimônias e recepções inesquecíveis, planejadas com elegância do início ao fim.",
    // Foto real: cerimônia de casamento no salão (noiva de véu no altar).
    image: "/images/portfolio/casamentos/casamentos-09.jpg",
  },
  {
    slug: "15-anos",
    title: "15 Anos",
    description:
      "Uma festa à altura do momento, com ambientação luxuosa e experiência impecável.",
    // Foto real: debutante de vestido azul ao lado da mesa do bolo.
    image: "/images/portfolio/quinze-anos/quinze-anos-21.jpg",
  },
  {
    slug: "aniversarios",
    title: "Aniversários",
    description:
      "Comemorações personalizadas para celebrar cada idade com estilo e requinte.",
    image: "/images/eventos/aniversario.jpg",
  },
  {
    slug: "eventos-corporativos",
    title: "Eventos Corporativos",
    description:
      "Confraternizações, lançamentos e conferências com estrutura profissional completa.",
    // Foto real: mesa posta com numeração e cardápio, montagem formal.
    image: "/images/portfolio/casamentos/casamentos-26.jpg",
  },
  {
    slug: "cha-revelacao",
    title: "Chá Revelação",
    description:
      "Momentos únicos transformados em celebrações delicadas e cheias de emoção.",
    // Foto real: mesas em azul e rosa-claro, no clima de um chá revelação.
    image: "/images/portfolio/infantil/infantil-21.jpg",
  },
  {
    slug: "formaturas",
    title: "Formaturas",
    description:
      "Celebre essa conquista com uma festa memorável e à altura do seu esforço.",
    image: "/images/eventos/formatura.jpg",
  },
];

// Galeria com fotos REAIS de eventos realizados pela Rosa Buffet.
// Para ampliar o acervo, basta adicionar novos itens a esta lista.
export const galleryImages: { src: string; alt: string }[] = [
  { src: "/images/eventos/quinze-anos-debutante.jpg", alt: "Debutante em festa de 15 anos com painel dourado" },
  { src: "/images/portfolio/infantil/infantil-25.jpg", alt: "Bolo da Minnie em festa infantil" },
  { src: "/images/portfolio/quinze-anos/quinze-anos-04.jpg", alt: "Máscara veneziana e flores em festa de 15 anos" },
  { src: "/images/portfolio/casamentos/casamentos-03.jpg", alt: "Mesa do bolo com tapete vermelho em casamento" },
  { src: "/images/portfolio/formaturas/formaturas-05.jpg", alt: "Mesa decorada de formatura do ABC" },
  { src: "/images/eventos/casamento-mesa-bolo-recorte.jpg", alt: "Bolo de casamento em mesa dourada entalhada, com espelho ao fundo" },
  { src: "/images/portfolio/infantil/infantil-14.jpg", alt: "Mesa de doces e bolo em festa infantil com balões" },
  { src: "/images/portfolio/formaturas/formaturas-03.jpg", alt: "Bolo de formatura do ABC com letras coloridas" },
  { src: "/images/portfolio/casamentos/casamentos-13.jpg", alt: "Entrada do salão com cortinas e luzes em casamento" },
];

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "Como solicitar um orçamento?",
    answer:
      "É simples: basta clicar em um dos botões \"Solicitar orçamento\" espalhados pelo site, que abrirão uma conversa direta pelo WhatsApp com nossa equipe.",
  },
  {
    question: "Vocês possuem espaço próprio?",
    answer:
      "Sim. A Rosa Buffet conta com estrutura própria, totalmente equipada para receber eventos de diferentes portes com conforto e sofisticação.",
  },
  {
    question: "Atendem eventos corporativos?",
    answer:
      "Sim, realizamos confraternizações, lançamentos de produtos, conferências e demais eventos corporativos com estrutura profissional completa.",
  },
  {
    question: "Posso personalizar meu evento?",
    answer:
      "Com certeza. Cada evento é planejado sob medida, respeitando o estilo, o orçamento e as expectativas de cada cliente.",
  },
  {
    question: "Qual o prazo ideal para reservar uma data?",
    answer:
      "Recomendamos entrar em contato com a maior antecedência possível, especialmente para datas de alta demanda, garantindo assim maior disponibilidade de agenda.",
  },
];
