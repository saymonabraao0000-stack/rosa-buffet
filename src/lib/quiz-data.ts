import { portfolioCategories } from "./portfolio-data";

function imageForTheme(slug: string) {
  return portfolioCategories.find((c) => c.slug === slug)?.images[0]?.src;
}

export type QuizTheme = {
  slug: string;
  label: string;
  image?: string;
};

// As 5 primeiras opções reaproveitam os mesmos temas do portfólio
// (/celebracoes) para manter a categorização do site consistente de ponta a
// ponta — a foto de capa de cada uma vem da primeira imagem daquele tema.
export const quizThemes: QuizTheme[] = [
  { slug: "quinze-anos", label: "15 Anos", image: imageForTheme("quinze-anos") },
  { slug: "casamentos", label: "Casamento", image: imageForTheme("casamentos") },
  { slug: "infantil", label: "Festa Infantil", image: imageForTheme("infantil") },
  { slug: "formaturas", label: "Formatura", image: imageForTheme("formaturas") },
  { slug: "aniversarios", label: "Aniversário", image: imageForTheme("aniversarios") },
  { slug: "outro", label: "Corporativo / Outro" },
];

export type GuestRange = {
  slug: string;
  label: string;
  estimateGuests: number;
};

export const guestRanges: GuestRange[] = [
  { slug: "ate-50", label: "Até 50 convidados", estimateGuests: 50 },
  { slug: "51-100", label: "51 a 100 convidados", estimateGuests: 80 },
  { slug: "101-150", label: "101 a 150 convidados", estimateGuests: 130 },
  { slug: "151-250", label: "151 a 250 convidados", estimateGuests: 200 },
  { slug: "mais-250", label: "Mais de 250 convidados", estimateGuests: 300 },
];

/**
 * Valores ILUSTRATIVOS, usados apenas para o simulador funcionar de ponta a
 * ponta em produção enquanto os valores reais não chegam.
 * TODO: substituir pelo preço real por convidado de cada nível de cardápio
 * da Rosa Buffet antes de tratar a estimativa exibida como confiável.
 */
export type BuffetTier = {
  slug: string;
  label: string;
  description: string;
  pricePerGuest: number;
};

export const buffetTiers: BuffetTier[] = [
  {
    slug: "essencial",
    label: "Essencial",
    description:
      "Cardápio completo com entrada, prato principal e sobremesa em opções clássicas.",
    pricePerGuest: 120,
  },
  {
    slug: "completo",
    label: "Completo",
    description:
      "Cardápio ampliado, estações temáticas e montagem de mesa mais elaborada.",
    pricePerGuest: 180,
  },
  {
    slug: "premium",
    label: "Premium",
    description:
      "Experiência gastronômica completa, com curadoria de chef e serviço à francesa.",
    pricePerGuest: 260,
  },
];

/** Valores ILUSTRATIVOS — mesmo aviso do cardápio acima. */
export type Addon = {
  slug: string;
  label: string;
  description: string;
} & ({ kind: "flat"; price: number } | { kind: "perGuest"; price: number });

export const addons: Addon[] = [
  {
    slug: "cabine-fotos",
    label: "Cabine de fotos",
    description: "Cabine com props e impressão na hora para os convidados.",
    kind: "flat",
    price: 1200,
  },
  {
    slug: "dj",
    label: "DJ e som profissional",
    description: "Som, iluminação de pista e DJ durante todo o evento.",
    kind: "flat",
    price: 1800,
  },
  {
    slug: "decoracao-premium",
    label: "Decoração temática premium",
    description: "Ambientação autoral acima do padrão incluso no cardápio.",
    kind: "perGuest",
    price: 25,
  },
  {
    slug: "doces",
    label: "Mesa de doces personalizada",
    description: "Mesa de doces com identidade visual do evento.",
    kind: "perGuest",
    price: 18,
  },
  {
    slug: "open-bar",
    label: "Open bar / drinks especiais",
    description: "Bar de drinks não alcoólicos e coquetéis para os convidados.",
    kind: "perGuest",
    price: 45,
  },
  {
    slug: "cerimonialista",
    label: "Cerimonialista dedicada",
    description: "Acompanhamento completo do roteiro e do cronograma do dia.",
    kind: "flat",
    price: 2200,
  },
];

export function calculateEstimate({
  guests,
  buffetTierSlug,
  addonSlugs,
}: {
  guests: number;
  buffetTierSlug: string;
  addonSlugs: string[];
}) {
  const tier = buffetTiers.find((t) => t.slug === buffetTierSlug);
  const buffetTotal = (tier?.pricePerGuest ?? 0) * guests;
  const addonsTotal = addonSlugs.reduce((sum, slug) => {
    const addon = addons.find((a) => a.slug === slug);
    if (!addon) return sum;
    return sum + (addon.kind === "flat" ? addon.price : addon.price * guests);
  }, 0);
  const total = buffetTotal + addonsTotal;
  const round = (n: number) => Math.round(n / 50) * 50;
  return {
    total,
    min: round(total * 0.9),
    max: round(total * 1.1),
  };
}
