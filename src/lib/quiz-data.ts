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

export type GuestOption = {
  slug: string;
  label: string;
  /** null = "mais de 150" — fora das faixas com preço fechado, fica sob consulta. */
  guests: number | null;
};

// As faixas batem exatamente com as 4 quantidades que a Rosa Buffet
// realmente precifica (ver partyPackages abaixo) — não são faixas
// arbitrárias, são as únicas quantidades com preço fechado.
export const guestOptions: GuestOption[] = [
  { slug: "80", label: "Até 80 convidados", guests: 80 },
  { slug: "100", label: "Até 100 convidados", guests: 100 },
  { slug: "120", label: "Até 120 convidados", guests: 120 },
  { slug: "150", label: "Até 150 convidados", guests: 150 },
  { slug: "mais-150", label: "Mais de 150 convidados", guests: null },
];

/**
 * Os dois pacotes fechados da Rosa Buffet — valores REAIS, informados pelo
 * dono do negócio em 2026-08-25 (ver public/PDFs/Rosa-Buffet-Pacote-*.pdf
 * para a lista completa do que está incluso em cada um).
 *
 * São pacotes fechados: cerimonial, fotografia, bolo, doces, salão,
 * decoração, buffet, DJ e cabine fotográfica já vêm inclusos nos dois —
 * não dá para adicionar ou remover item avulso, por isso o quiz não tem
 * mais uma etapa de "opcionais".
 */
export type PartyPackage = {
  slug: string;
  label: string;
  tagline: string;
  /** O que diferencia esse pacote do outro (não é a lista completa). */
  highlights: string[];
  pricesByGuests: Record<number, number>;
  note?: string;
  /**
   * Se definido, o pacote só aparece no quiz quando o tema escolhido está
   * nessa lista (ex.: Kids só faz sentido para festa infantil). Sem esse
   * campo, o pacote aparece pra qualquer tema — é o caso do Premium e do
   * Gold, que são genéricos.
   */
  themes?: string[];
};

export const partyPackages: PartyPackage[] = [
  {
    slug: "premium",
    label: "Premium",
    tagline: "Elegância sob medida",
    highlights: [
      "2 pratos quentes · 100 doces finos",
      "Cerimonial, fotografia, bolo de 3 andares, decoração completa, DJ e cabine fotográfica inclusos",
    ],
    pricesByGuests: { 80: 9999, 100: 10999, 120: 12500, 150: 13999 },
    note: "Pacote com poucas vagas — consulte a disponibilidade da sua data. Parcelamos em até 8x sem juros.",
  },
  {
    slug: "gold",
    label: "Gold",
    tagline: "O mais completo",
    highlights: [
      "3 pratos quentes · 200 doces finos · open bar",
      "Tudo do Premium, mais filmagem/book externo, mais um suco e playground/sala de jogos",
    ],
    pricesByGuests: { 80: 12999, 100: 13999, 120: 14999, 150: 16999 },
  },
  {
    slug: "kids",
    label: "Kids",
    tagline: "Feito pra fazer criança sorrir",
    highlights: [
      "Decoração temática completa · pista de dança em LED · painel 2×2 · playground (pula-pula, casinha de bolinhas, pebolim, flíperama)",
      "Cerimonialista e palhaço acompanhando o dia todo, além de cabine fotográfica e lembrancinhas para os convidados",
    ],
    pricesByGuests: { 80: 9999, 100: 10999, 120: 12500, 150: 13999 },
    note: "Valores conforme o Pacote Kids da Rosa Buffet — consulte disponibilidade da sua data.",
    themes: ["infantil"],
  },
];

export function getPackagePrice(pkgSlug: string, guests: number | null): number | null {
  if (guests == null) return null;
  const pkg = partyPackages.find((p) => p.slug === pkgSlug);
  return pkg?.pricesByGuests[guests] ?? null;
}

/**
 * Labels tolerantes para exibir leads antigos no CRM: leads criados antes
 * dessa mudança de preços podem ter slugs de um formato anterior (faixas
 * tipo "51-100", tier "essencial", addons) que não existem mais nas listas
 * acima. Em vez de quebrar a página, essas funções caem no slug cru quando
 * não encontram — melhor mostrar o dado bruto do que sumir com ele.
 */
export function getThemeLabel(slug: string | null): string | undefined {
  if (!slug) return undefined;
  return quizThemes.find((t) => t.slug === slug)?.label ?? slug;
}

export function getGuestLabel(slug: string | null): string | undefined {
  if (!slug) return undefined;
  return guestOptions.find((g) => g.slug === slug)?.label ?? slug;
}

export function getPartyPackageLabel(slug: string | null): string | undefined {
  if (!slug) return undefined;
  return partyPackages.find((p) => p.slug === slug)?.label ?? slug;
}
