import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  ChefHat,
  Gem,
  Heart,
  Home,
  Sparkles,
  UsersRound,
  Wand2,
} from "lucide-react";

/**
 * As imagens em "/images/eventos/..." são fotos REAIS de eventos
 * realizados pela Rosa Buffet.
 *
 * Alguns cards (festas infantis, eventos corporativos, chá revelação
 * e buffet gastronômico) ainda usam imagens de banco de imagens livre
 * (Unsplash) como placeholder, pois não havia foto real disponível.
 * Para substituí-las, basta trocar a URL por um arquivo em
 * /public/images/eventos/... — nenhum outro ajuste é necessário.
 */
function unsplash(id: string, w = 1200, q = 80) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

// Foto real: salão próprio da Rosa Buffet totalmente montado.
export const heroImage = "/images/eventos/salao-15-anos.jpg";

// Foto real: casamento realizado pela Rosa Buffet.
export const aboutImage = "/images/eventos/casamento-noivos.jpg";

export type Differentiator = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const differentiators: Differentiator[] = [
  {
    title: "Estrutura própria",
    description:
      "Espaço amplo e totalmente equipado para eventos de todos os portes, sem depender de terceiros.",
    icon: Home,
  },
  {
    title: "Equipe especializada",
    description:
      "Profissionais experientes em gastronomia, decoração e cerimonial dedicados a cada detalhe.",
    icon: UsersRound,
  },
  {
    title: "Atendimento personalizado",
    description:
      "Cada cliente recebe um planejamento sob medida, alinhado ao estilo e à identidade do evento.",
    icon: Heart,
  },
  {
    title: "Decoração exclusiva",
    description:
      "Ambientações autorais que traduzem sofisticação e elevam a experiência dos convidados.",
    icon: Sparkles,
  },
  {
    title: "Buffet completo",
    description:
      "Cardápios elaborados com ingredientes selecionados, do coquetel de boas-vindas à sobremesa.",
    icon: ChefHat,
  },
  {
    title: "Planejamento do início ao fim",
    description:
      "Acompanhamento completo, da primeira reunião ao último convidado deixar o salão.",
    icon: CalendarCheck,
  },
  {
    title: "Experiência consolidada",
    description:
      "Anos de tradição em Manaus, com centenas de celebrações realizadas com excelência.",
    icon: Gem,
  },
  {
    title: "Eventos personalizados",
    description:
      "Soluções flexíveis para casamentos, festas corporativas, aniversários e muito mais.",
    icon: Wand2,
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
    // TODO: substituir por foto real de festa infantil quando disponível.
    image: unsplash("1558636508-e0db3814bd1d"),
  },
  {
    slug: "casamentos",
    title: "Casamentos",
    description:
      "Cerimônias e recepções inesquecíveis, planejadas com elegância do início ao fim.",
    image: "/images/eventos/casamento-beijo.jpg",
  },
  {
    slug: "15-anos",
    title: "15 Anos",
    description:
      "Uma festa à altura do momento, com ambientação luxuosa e experiência impecável.",
    image: "/images/eventos/quinze-anos-debutante.jpg",
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
    // TODO: substituir por foto real de evento corporativo quando disponível.
    image: unsplash("1511578314322-379afb476865"),
  },
  {
    slug: "cha-revelacao",
    title: "Chá Revelação",
    description:
      "Momentos únicos transformados em celebrações delicadas e cheias de emoção.",
    // TODO: substituir por foto real de chá revelação quando disponível.
    image: unsplash("1519225421980-715cb0215aed"),
  },
  {
    slug: "formaturas",
    title: "Formaturas",
    description:
      "Celebre essa conquista com uma festa memorável e à altura do seu esforço.",
    image: "/images/eventos/formatura.jpg",
  },
  {
    slug: "decoracao",
    title: "Decoração",
    description:
      "Ambientações autorais que traduzem sofisticação em cada elemento do espaço.",
    image: "/images/eventos/casamento-mesa-bolo.jpg",
  },
  {
    slug: "buffet-completo",
    title: "Buffet Completo",
    description:
      "Gastronomia refinada, do coquetel de boas-vindas à sobremesa, para todos os paladares.",
    // TODO: substituir por foto real do buffet/gastronomia quando disponível.
    image: unsplash("1467003909585-2f8a72700288"),
  },
  {
    slug: "producao-de-eventos",
    title: "Produção de Eventos",
    description:
      "Planejamento e execução completos, cuidando de cada etapa com excelência.",
    image: "/images/eventos/casamento-bolo-verde.jpg",
  },
  {
    slug: "eventos-personalizados",
    title: "Eventos Personalizados",
    description:
      "Projetos sob medida para transformar qualquer ocasião em uma experiência única.",
    image: "/images/eventos/quinze-anos-quadro.jpg",
  },
];

// Galeria com fotos REAIS de eventos realizados pela Rosa Buffet.
// Para ampliar o acervo, basta adicionar novos itens a esta lista.
export const galleryImages: { src: string; alt: string }[] = [
  { src: "/images/eventos/casamento-mesa-bolo.jpg", alt: "Mesa do bolo em decoração dourada de casamento" },
  { src: "/images/eventos/salao-15-anos.jpg", alt: "Salão da Rosa Buffet montado para festa de 15 anos" },
  { src: "/images/eventos/aniversario.jpg", alt: "Painel dourado e cadeiras clássicas em aniversário" },
  { src: "/images/eventos/casamento-beijo.jpg", alt: "Noivos em cerimônia realizada pela Rosa Buffet" },
  { src: "/images/eventos/formatura.jpg", alt: "Mesa do bolo em festa de formatura" },
  { src: "/images/eventos/quinze-anos-debutante.jpg", alt: "Debutante em festa de 15 anos com painel dourado" },
  { src: "/images/eventos/casamento-bolo-verde.jpg", alt: "Bolo e decoração verde e dourada de casamento" },
  { src: "/images/eventos/casamento-noivos.jpg", alt: "Noivos em recepção elegante" },
  { src: "/images/eventos/quinze-anos-quadro.jpg", alt: "Detalhe decorativo de festa de 15 anos" },
];

export type ProcessStep = {
  title: string;
  description: string;
};

export const processSteps: ProcessStep[] = [
  {
    title: "Você entra em contato",
    description: "Fale com nossa equipe pelo WhatsApp e conte um pouco sobre o seu evento.",
  },
  {
    title: "Entendemos seu evento",
    description: "Ouvimos seus objetivos, estilo e expectativas para desenhar a proposta ideal.",
  },
  {
    title: "Elaboramos um orçamento personalizado",
    description: "Apresentamos uma proposta sob medida, com transparência em cada detalhe.",
  },
  {
    title: "Organizamos todos os detalhes",
    description: "Cuidamos do planejamento completo, da decoração ao cardápio e cronograma.",
  },
  {
    title: "Realizamos uma celebração inesquecível",
    description: "No grande dia, nossa equipe garante que tudo aconteça com excelência.",
  },
];

export type Testimonial = {
  name: string;
  city: string;
  rating: number;
  quote: string;
  initials: string;
};

/**
 * Depoimentos fictícios, usados apenas como demonstração de layout.
 * TODO: substituir por depoimentos reais de clientes da Rosa Buffet
 * antes de publicar o site em produção.
 */
export const testimonials: Testimonial[] = [
  {
    name: "Camila Souza",
    city: "Manaus, AM",
    rating: 5,
    quote:
      "A equipe da Rosa Buffet transformou meu casamento em um sonho realizado. Cada detalhe foi pensado com muito carinho e profissionalismo.",
    initials: "CS",
  },
  {
    name: "Rafael Almeida",
    city: "Manaus, AM",
    rating: 5,
    quote:
      "Contratamos para um evento corporativo e a organização foi impecável do início ao fim. Recomendo sem hesitar.",
    initials: "RA",
  },
  {
    name: "Juliana Ferreira",
    city: "Manaus, AM",
    rating: 5,
    quote:
      "A festa de 15 anos da minha filha ficou incrível. Estrutura, decoração e atendimento de altíssimo nível.",
    initials: "JF",
  },
  {
    name: "Marcos Vinícius",
    city: "Manaus, AM",
    rating: 5,
    quote:
      "Profissionalismo do início ao fim. O buffet foi elogiado por todos os convidados e a decoração superou nossas expectativas.",
    initials: "MV",
  },
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
