/**
 * Conteúdo estruturado das páginas de pacote (/pacotes/[slug]), extraído
 * de public/PDFs/Rosa-Buffet-Pacote-{Premium,Gold,Kids}-Apresentacao.pdf
 * em 24/09/2026. Preços e nota vêm de src/lib/quiz-data.ts / do setting
 * "precos" (fallback getDefaultPrecos()) — não estão repetidos aqui.
 */

export type PacoteGroup = {
  title: string;
  items: string[];
};

export type PacoteContent = {
  slug: "premium" | "gold" | "kids";
  heroImage: string;
  heroAlt: string;
  gallery: { src: string; alt: string }[];
  groups: PacoteGroup[];
  metaDescription: string;
};

export const pacotesContent: Record<string, PacoteContent> = {
  premium: {
    slug: "premium",
    heroImage: "/images/eventos/casamento-noivos.jpg",
    heroAlt: "Casal em festa elegante organizada pela Rosa Buffet, Pacote Premium",
    gallery: [
      { src: "/images/portfolio/casamentos/casamentos-01.jpg", alt: "Salão decorado do Pacote Premium" },
      { src: "/images/portfolio/quinze-anos/quinze-anos-01.jpg", alt: "Mesa de doces do Pacote Premium" },
      { src: "/images/eventos/casamento-mesa-bolo.jpg", alt: "Bolo de três andares do Pacote Premium" },
      { src: "/images/portfolio/casamentos/casamentos-03.jpg", alt: "Decoração da pista do Pacote Premium" },
    ],
    metaDescription:
      "Pacote Premium da Rosa Buffet: cerimonial, fotografia, bolo de 3 andares, salão climatizado, decoração completa, buffet, DJ e cabine fotográfica. Valores a partir de R$ 9.999.",
    groups: [
      {
        title: "Cerimonial & Fotografia",
        items: [
          "Cerimonial: 1 reunião presencial, organização completa do evento",
          "Fotografia: cobertura de todo o evento",
        ],
      },
      {
        title: "Bolo & Doces",
        items: ["Bolo verdadeiro de 3 andares", "300 doces tradicionais · 100 doces finos"],
      },
      {
        title: "Salão & Decoração",
        items: [
          "Salão climatizado, com camarim e segurança para os carros",
          "Mesa imperial dourada · mesa dos doces (imperial) · layout para fotos",
          "Lustres e passarela · 3 fotos 90×60 impressas",
          "Cadeira Tiffany, mesas e cadeiras de convidados (mesas de 10) · mesa para presentes",
        ],
      },
      {
        title: "Buffet",
        items: [
          "2 pratos quentes · 3 acompanhamentos",
          "Refrigerantes (Coca-Cola, Baré, Antarctica) · 2 sucos (goiaba, cupuaçu)",
          "Sobremesa (mousse) · salgados fritos na hora",
          "Louça completa · garçons e copeiro",
        ],
      },
      {
        title: "DJ & Som",
        items: [
          "Estrutura com iluminação · data show e tela",
          "Caixa de som · microfone sem fio · iluminação moving e outros",
        ],
      },
      {
        title: "Cabine Fotográfica & Cortesias",
        items: [
          "Cabine fotográfica: plataforma 360, túnel fotográfico, balanço de LED",
          "Cortesias: quadro de assinatura, pista Paris, convite virtual",
        ],
      },
    ],
  },
  gold: {
    slug: "gold",
    heroImage: "/images/eventos/salao-15-anos.jpg",
    heroAlt: "Salão preparado para festa do Pacote Gold da Rosa Buffet",
    gallery: [
      { src: "/images/portfolio/quinze-anos/quinze-anos-02.jpg", alt: "Decoração completa do Pacote Gold" },
      { src: "/images/portfolio/casamentos/casamentos-02.jpg", alt: "Open bar e mesa de doces do Pacote Gold" },
      { src: "/images/eventos/quinze-anos-quadro.jpg", alt: "Quadro de assinatura do Pacote Gold" },
      { src: "/images/portfolio/quinze-anos/quinze-anos-03.jpg", alt: "Pista e iluminação do Pacote Gold" },
    ],
    metaDescription:
      "Pacote Gold da Rosa Buffet: tudo do Premium, mais filmagem, book externo, open bar, playground e sala de jogos. O pacote mais completo, a partir de R$ 12.999.",
    groups: [
      {
        title: "Cerimonial & Fotografia",
        items: [
          "Cerimonial: 1 reunião presencial, organização completa do evento",
          "Fotografia: cobertura de todo o evento, filmagem/vídeo maker, book externo, fotos externas",
        ],
      },
      {
        title: "Bolo & Doces",
        items: ["Bolo verdadeiro de 3 andares", "300 doces tradicionais · 200 doces finos"],
      },
      {
        title: "Salão & Decoração",
        items: [
          "Salão climatizado, com camarim e segurança para os carros",
          "Mesa imperial dourada · mesa dos doces (imperial) · layout para fotos",
          "Iluminação externa e interna · lustres e passarela · tecidos em todo o salão",
          "3 fotos 90×60 impressas · cadeira Tiffany, mesas e cadeiras de convidados (mesas de 10) · mesa para presentes",
        ],
      },
      {
        title: "Buffet & Open Bar",
        items: [
          "3 pratos quentes · 3 acompanhamentos",
          "Refrigerantes (Coca-Cola, Baré, Antarctica) · 3 sucos (goiaba, cupuaçu, maracujá)",
          "Sobremesa: taça da felicidade · salgados fritos na hora",
          "Open bar (drinks e coquetel) · louça completa · garçons e copeiro",
        ],
      },
      {
        title: "DJ & Som",
        items: [
          "Estrutura com iluminação · data show e tela",
          "Caixa de som · microfone sem fio · iluminação moving e outros",
        ],
      },
      {
        title: "Cabine Fotográfica, Cortesias & Diversão",
        items: [
          "Cabine fotográfica: plataforma 360, túnel fotográfico, balanço de LED",
          "Cortesias: pista Paris, quadro de assinatura, convite virtual",
          "Diversão: playground e sala de jogos, pula-pula, casinha de bolinhas, fliperama, basquete e outros",
        ],
      },
    ],
  },
  kids: {
    slug: "kids",
    heroImage: "/images/eventos/aniversario.jpg",
    heroAlt: "Decoração temática do Pacote Kids da Rosa Buffet",
    gallery: [
      { src: "/images/portfolio/infantil/infantil-01.jpg", alt: "Decoração temática do Pacote Kids" },
      { src: "/images/portfolio/infantil/infantil-02.jpg", alt: "Playground do Pacote Kids" },
      { src: "/images/portfolio/infantil/infantil-03.jpg", alt: "Mesa de bolo temática do Pacote Kids" },
      { src: "/images/portfolio/infantil/infantil-04.jpg", alt: "Pista de dança em LED do Pacote Kids" },
    ],
    metaDescription:
      "Pacote Kids da Rosa Buffet: decoração temática completa, playground, cerimonialista e palhaço, buffet infantil e adulto. Feito pra fazer criança sorrir, a partir de R$ 9.999.",
    groups: [
      {
        title: "Decoração & Ambientação",
        items: [
          "Decoração temática completa · mesa de bolo temática",
          "Mesas e cadeiras para os convidados · mesa para doces · mesa de presentes · mesa de entrada",
          "Capas e toalhas · 1.000 balões · 3 fotos impressas 90×60",
          "Centro de mesa do local · entrada de festa · lustres · layout de festa",
          "Pista de dança em LED · painel 2×2",
        ],
      },
      {
        title: "Bolo & Doces",
        items: ["Bolo verdadeiro de 3 andares, totalmente comestível", "300 doces tradicionais · 100 doces finos"],
      },
      {
        title: "Buffet Infantil & Adulto",
        items: [
          "Buffet infantil: itens a serem escolhidos no cardápio",
          "Buffet adulto: 2 pratos quentes · 3 acompanhamentos (arroz, farofa e salada)",
          "Refrigerantes (Coca-Cola, Fanta, Baré) · salgados fritos na hora · suco de goiaba",
          "Sobremesa (mousse) · louça completa · água mineral · garçons e copeiro",
        ],
      },
      {
        title: "Fotógrafo & Playground",
        items: [
          "Cabine fotográfica: plataforma 360, túnel para fotos",
          "Playground: pula-pula, casinha de bolinhas, pebolim, fliperama, escorregador e outros",
        ],
      },
      {
        title: "DJ & Salão de Festa",
        items: [
          "DJ e som: estrutura com iluminação, data show e tela, caixa de som, microfone sem fio",
          "Salão de festa: espaço climatizado para o evento",
        ],
      },
      {
        title: "Lembranças, Cerimonialista & Palhaço",
        items: [
          "Lembranças: 60 personagens · 20 marshmallows · 20 pirulitos · 15 baldes · 10 kits de pintura",
          "Cerimonialista e palhaço acompanhando o dia todo, com brincadeiras para adultos e crianças",
        ],
      },
    ],
  },
};

export function getPacoteContent(slug: string): PacoteContent | undefined {
  return pacotesContent[slug];
}
