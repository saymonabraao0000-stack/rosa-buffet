/**
 * Conteúdo central das páginas de SEO local por tipo de festa
 * (/festas e /festas/[slug]). Cada entrada reaproveita dados já existentes
 * em quiz-data.ts (pacotes e preços), pacotes-data.ts (o que está incluso)
 * e portfolio-data.ts (fotos reais) — nada aqui inventa fato novo sobre o
 * negócio, só organiza o que já existe em formato de página de destino.
 */

import { portfolioCategories } from "./portfolio-data";
import { partyPackages } from "./quiz-data";

export type FestaFaq = {
  question: string;
  answer: string;
};

export type FestaPhoto = {
  src: string;
  alt: string;
};

export type FestaContent = {
  slug: string;
  h1: string;
  /** Título da seção "Como é a festa" (ex.: "Como é uma festa de 15 anos na Rosa Buffet"). */
  introHeading: string;
  metaTitle: string;
  metaDescription: string;
  /** Slug do tema no portfólio (/celebracoes), quando existir. */
  portfolioTheme?: string;
  heroImage: string;
  heroAlt: string;
  /** Parágrafos curtos sobre como é a festa na Rosa Buffet. */
  intro: string[];
  /** Pacotes recomendados para esse tipo de festa. */
  packageSlugs: string[];
  gallery: FestaPhoto[];
  faq: FestaFaq[];
};

function firstPhotosOfTheme(themeSlug: string, count: number): FestaPhoto[] {
  const theme = portfolioCategories.find((c) => c.slug === themeSlug);
  if (!theme) return [];
  return theme.images.slice(0, count).map((img, i) => ({
    src: img.src,
    alt: `${theme.label} realizado pela Rosa Buffet, foto ${i + 1}`,
  }));
}

export function getPackageBySlug(slug: string) {
  return partyPackages.find((p) => p.slug === slug);
}

export const festas: FestaContent[] = [
  {
    slug: "buffet-infantil-manaus",
    h1: "Buffet Infantil em Manaus",
    introHeading: "Como é uma festa infantil na Rosa Buffet",
    metaTitle: "Buffet Infantil em Manaus | Rosa Buffet",
    metaDescription:
      "Buffet infantil em Manaus com decoração temática, playground, cerimonialista e palhaço. Pacote Kids da Rosa Buffet, na Cidade de Deus. Simule sua festa.",
    portfolioTheme: "infantil",
    heroImage: "/images/portfolio/infantil/infantil-01.jpg",
    heroAlt: "Decoração temática de festa infantil realizada pela Rosa Buffet",
    intro: [
      "A Rosa Buffet fica na Rua São João, 310, no bairro Cidade de Deus, em Manaus, e monta festas infantis com decoração temática completa, playground e buffet para crianças e adultos no mesmo espaço.",
      "O Pacote Kids inclui decoração temática e mesa de bolo temática, pista de dança em LED, painel 2×2, playground com pula-pula, casinha de bolinhas, pebolim e fliperama, cerimonialista e palhaço acompanhando o dia todo, cabine fotográfica, bolo de 3 andares e buffet infantil e adulto completos.",
      "É um pacote fechado: os itens já vêm inclusos, sem cobrança avulsa por item extra.",
    ],
    packageSlugs: ["kids"],
    gallery: firstPhotosOfTheme("infantil", 6),
    faq: [
      {
        question: "O buffet infantil da Rosa Buffet inclui decoração?",
        answer:
          "Sim. O Pacote Kids inclui decoração temática completa, mesa de bolo temática, painel 2×2, pista de dança em LED e 1.000 balões, sem custo extra por item.",
      },
      {
        question: "Tem playground para as crianças?",
        answer:
          "Sim. O pacote inclui playground com pula-pula, casinha de bolinhas, pebolim, fliperama e escorregador, além de cerimonialista e palhaço acompanhando a festa toda.",
      },
      {
        question: "O buffet serve os adultos também?",
        answer:
          "Sim. Além do buffet infantil, o pacote inclui buffet adulto com 2 pratos quentes, 3 acompanhamentos, refrigerantes, suco, sobremesa e água mineral, com garçons e copeiro.",
      },
      {
        question: "Como faço para simular o valor da minha festa infantil?",
        answer:
          "Pelo simulador em /orcamento, escolhendo o tema Festa Infantil e a faixa de convidados: o valor do Pacote Kids aparece na hora, conforme a quantidade escolhida.",
      },
      {
        question: "Como reservo a data da festa?",
        answer:
          "A reserva é garantida com um sinal de R$ 500. Você pode simular sua festa em /orcamento ou agendar uma visita ao salão em /visita para ver o espaço antes de decidir.",
      },
    ],
  },
  {
    slug: "festa-de-15-anos-manaus",
    h1: "Festa de 15 Anos em Manaus",
    introHeading: "Como é uma festa de 15 anos na Rosa Buffet",
    metaTitle: "Festa de 15 Anos em Manaus | Rosa Buffet",
    metaDescription:
      "Festa de 15 anos em Manaus com salão próprio, cerimonial, decoração completa e buffet. Pacotes Premium e Gold da Rosa Buffet, na Cidade de Deus.",
    portfolioTheme: "quinze-anos",
    heroImage: "/images/portfolio/quinze-anos/quinze-anos-01.jpg",
    heroAlt: "Salão decorado para festa de 15 anos realizada pela Rosa Buffet",
    intro: [
      "A Rosa Buffet organiza festas de 15 anos no seu próprio salão, na Rua São João, 310, Cidade de Deus, em Manaus — com cerimonial, decoração, fotografia, bolo, DJ e buffet já inclusos no pacote fechado.",
      "No Pacote Premium a festa vem com cerimonial e fotografia, bolo verdadeiro de 3 andares, 100 doces finos, salão climatizado com camarim, mesa imperial dourada, cadeira Tiffany, DJ com estrutura de iluminação e cabine fotográfica 360. O Pacote Gold soma a isso filmagem e book externo, open bar, um terceiro sabor de suco e playground com sala de jogos para os convidados mais jovens.",
      "Os dois pacotes são fechados: os itens listados já vêm inclusos, sem cobrança avulsa por item.",
    ],
    packageSlugs: ["premium", "gold"],
    gallery: firstPhotosOfTheme("quinze-anos", 6),
    faq: [
      {
        question: "O que está incluso na festa de 15 anos da Rosa Buffet?",
        answer:
          "Cerimonial, fotografia, bolo verdadeiro de 3 andares, doces, salão climatizado com decoração completa (mesa imperial dourada, cadeira Tiffany, lustres e passarela), buffet, DJ com estrutura de som e luz, e cabine fotográfica. O Pacote Gold acrescenta filmagem, book externo, open bar e playground.",
      },
      {
        question: "Qual a diferença entre o Pacote Premium e o Gold para 15 anos?",
        answer:
          "O Premium tem 2 pratos quentes e 100 doces finos. O Gold tem 3 pratos quentes, 200 doces finos, open bar, filmagem/book externo e playground com sala de jogos — é o pacote mais completo.",
      },
      {
        question: "O Pacote Premium pode ser parcelado?",
        answer:
          "Sim, o Pacote Premium pode ser parcelado em até 8x sem juros. Vale confirmar a condição atual direto com a equipe pelo WhatsApp.",
      },
      {
        question: "Quanto custa uma festa de 15 anos na Rosa Buffet?",
        answer:
          "O valor varia pela quantidade de convidados. Simule em /orcamento escolhendo o tema 15 Anos e a faixa de convidados para ver o valor de cada pacote na hora.",
      },
      {
        question: "Como garanto a data da minha festa de 15 anos?",
        answer:
          "Com um sinal de R$ 500 a data fica reservada. Dá para simular o orçamento em /orcamento ou agendar uma visita ao salão em /visita antes de decidir.",
      },
    ],
  },
  {
    slug: "buffet-para-casamento-manaus",
    h1: "Buffet para Casamento em Manaus",
    introHeading: "Como é um casamento na Rosa Buffet",
    metaTitle: "Buffet para Casamento em Manaus | Rosa Buffet",
    metaDescription:
      "Buffet para casamento em Manaus com cerimonial, decoração, fotografia e buffet completos. Pacotes Premium e Gold da Rosa Buffet, na Cidade de Deus.",
    portfolioTheme: "casamentos",
    heroImage: "/images/portfolio/casamentos/casamentos-01.jpg",
    heroAlt: "Casamento realizado no salão da Rosa Buffet",
    intro: [
      "A Rosa Buffet recebe casamentos no seu salão próprio, na Rua São João, 310, Cidade de Deus, em Manaus, com cerimonial, decoração, fotografia e buffet organizados de ponta a ponta.",
      "O Pacote Premium inclui cerimonial com reunião presencial, cobertura fotográfica do evento, bolo verdadeiro de 3 andares, salão climatizado com camarim e segurança para os carros, mesa imperial dourada, cadeira Tiffany, DJ com iluminação e cabine fotográfica 360. O Pacote Gold acrescenta filmagem, book externo, open bar e um terceiro prato quente.",
      "Os dois pacotes são fechados, com os itens já inclusos no valor, sem cobrança avulsa por item.",
    ],
    packageSlugs: ["premium", "gold"],
    gallery: firstPhotosOfTheme("casamentos", 6),
    faq: [
      {
        question: "O que está incluso no buffet para casamento da Rosa Buffet?",
        answer:
          "Cerimonial, fotografia, bolo de 3 andares, salão climatizado com decoração completa, buffet com pratos quentes e acompanhamentos, DJ e cabine fotográfica. O Pacote Gold soma filmagem, book externo e open bar.",
      },
      {
        question: "O salão tem estrutura para os convidados do casamento?",
        answer:
          "Sim. O salão é climatizado, com camarim e segurança para os carros, mesas e cadeiras Tiffany para os convidados (mesas de 10), mesa para presentes e iluminação interna.",
      },
      {
        question: "Vocês fazem filmagem do casamento?",
        answer:
          "A cobertura fotográfica está nos dois pacotes. Filmagem, vídeo maker e book externo entram no Pacote Gold.",
      },
      {
        question: "Como simulo o valor do buffet para o meu casamento?",
        answer:
          "Pelo simulador em /orcamento, escolhendo o tema Casamento e a faixa de convidados: o valor de cada pacote aparece na hora.",
      },
      {
        question: "Como reservo a data do casamento?",
        answer:
          "A reserva é garantida com um sinal de R$ 500. Dá para simular o orçamento em /orcamento ou agendar uma visita ao salão em /visita antes de decidir.",
      },
    ],
  },
  {
    slug: "festa-de-formatura-manaus",
    h1: "Festa de Formatura em Manaus",
    introHeading: "Como é uma festa de formatura na Rosa Buffet",
    metaTitle: "Festa de Formatura em Manaus | Rosa Buffet",
    metaDescription:
      "Festa de formatura em Manaus com salão próprio, cerimonial, decoração e buffet completos. Pacotes Premium e Gold da Rosa Buffet, na Cidade de Deus.",
    portfolioTheme: "formaturas",
    heroImage: "/images/portfolio/formaturas/formaturas-01.jpg",
    heroAlt: "Festa de formatura realizada no salão da Rosa Buffet",
    intro: [
      "A Rosa Buffet recebe festas de formatura no seu salão próprio, na Rua São João, 310, Cidade de Deus, em Manaus, com cerimonial, decoração, fotografia, bolo, DJ e buffet inclusos no pacote fechado.",
      "O Pacote Premium traz cerimonial, cobertura fotográfica, bolo verdadeiro de 3 andares, salão climatizado com mesa imperial dourada e cadeira Tiffany, DJ com estrutura de som e luz, e cabine fotográfica 360. O Pacote Gold acrescenta filmagem, book externo, open bar e playground para os convidados mais jovens.",
      "Os dois pacotes são fechados: tudo já vem incluso no valor, sem cobrança avulsa por item.",
    ],
    packageSlugs: ["premium", "gold"],
    gallery: firstPhotosOfTheme("formaturas", 6),
    faq: [
      {
        question: "O que está incluso na festa de formatura da Rosa Buffet?",
        answer:
          "Cerimonial, fotografia, bolo de 3 andares, salão climatizado com decoração completa, buffet, DJ com estrutura de som e luz, e cabine fotográfica. O Pacote Gold soma filmagem, book externo e open bar.",
      },
      {
        question: "Dá para comemorar formatura de turma grande?",
        answer:
          "O simulador em /orcamento calcula o valor para até 150 convidados nas faixas fechadas de 80, 100, 120 e 150 pessoas; acima disso o valor fica sob consulta.",
      },
      {
        question: "O Pacote Premium pode ser parcelado?",
        answer:
          "Sim, o Pacote Premium pode ser parcelado em até 8x sem juros. Confirme a condição atual direto com a equipe pelo WhatsApp.",
      },
      {
        question: "Como simulo o valor da festa de formatura?",
        answer:
          "Pelo simulador em /orcamento, escolhendo o tema Formatura e a faixa de convidados: o valor de cada pacote aparece na hora.",
      },
      {
        question: "Como reservo a data da festa?",
        answer:
          "Com um sinal de R$ 500 a data fica reservada. Dá para simular o orçamento em /orcamento ou agendar uma visita ao salão em /visita antes de decidir.",
      },
    ],
  },
  {
    slug: "festa-de-aniversario-manaus",
    h1: "Festa de Aniversário em Manaus",
    introHeading: "Como é uma festa de aniversário na Rosa Buffet",
    metaTitle: "Festa de Aniversário em Manaus | Rosa Buffet",
    metaDescription:
      "Festa de aniversário em Manaus com salão próprio, decoração, bolo e buffet completos. Pacotes Premium, Gold e Kids da Rosa Buffet, na Cidade de Deus.",
    portfolioTheme: "aniversarios",
    heroImage: "/images/eventos/aniversario.jpg",
    heroAlt: "Painel dourado e cadeiras clássicas em festa de aniversário na Rosa Buffet",
    intro: [
      "A Rosa Buffet organiza festas de aniversário de qualquer idade no seu salão próprio, na Rua São João, 310, Cidade de Deus, em Manaus, com decoração, bolo, buffet e DJ inclusos no pacote fechado.",
      "Para aniversário adulto, os Pacotes Premium e Gold trazem cerimonial, fotografia, bolo verdadeiro de 3 andares, salão climatizado com decoração completa, buffet e DJ. Para aniversário infantil, o Pacote Kids é o indicado, com decoração temática, playground, cerimonialista e palhaço.",
      "Todos os pacotes são fechados: os itens já vêm inclusos no valor, sem cobrança avulsa por item.",
    ],
    packageSlugs: ["premium", "gold", "kids"],
    gallery: [
      { src: "/images/eventos/aniversario.jpg", alt: "Painel dourado e cadeiras clássicas em festa de aniversário na Rosa Buffet" },
      { src: "/images/portfolio/aniversarios/aniversarios-01.jpg", alt: "Aniversário realizado pela Rosa Buffet" },
      { src: "/images/eventos/hero-salao.jpg", alt: "Salão da Rosa Buffet montado com mesas e lustre" },
      { src: "/images/eventos/salao-15-anos.jpg", alt: "Salão da Rosa Buffet preparado para festa" },
    ],
    faq: [
      {
        question: "A Rosa Buffet faz aniversário para qualquer idade?",
        answer:
          "Sim. Para aniversário adulto, os Pacotes Premium e Gold incluem cerimonial, decoração, buffet e DJ. Para aniversário infantil, o Pacote Kids inclui decoração temática, playground, cerimonialista e palhaço.",
      },
      {
        question: "Qual pacote escolher para um aniversário infantil?",
        answer:
          "O Pacote Kids, feito especificamente para festa infantil, com decoração temática completa, playground, cabine fotográfica e buffet infantil e adulto.",
      },
      {
        question: "O que está incluso no aniversário adulto?",
        answer:
          "Cerimonial, fotografia, bolo verdadeiro de 3 andares, doces, salão climatizado com decoração completa, buffet com pratos quentes e DJ com estrutura de som e luz.",
      },
      {
        question: "Como simulo o valor do meu aniversário?",
        answer:
          "Pelo simulador em /orcamento, escolhendo o tema (Aniversário ou Festa Infantil) e a faixa de convidados: o valor de cada pacote aparece na hora.",
      },
      {
        question: "Como reservo a data do aniversário?",
        answer:
          "Com um sinal de R$ 500 a data fica reservada. Dá para simular o orçamento em /orcamento ou agendar uma visita ao salão em /visita antes de decidir.",
      },
    ],
  },
  {
    slug: "eventos-corporativos-manaus",
    h1: "Eventos Corporativos em Manaus",
    introHeading: "Como é um evento corporativo na Rosa Buffet",
    metaTitle: "Eventos Corporativos em Manaus | Rosa Buffet",
    metaDescription:
      "Eventos corporativos em Manaus com salão próprio, estrutura completa e buffet. Confraternizações e lançamentos com a Rosa Buffet, na Cidade de Deus.",
    heroImage: "/images/eventos/hero-salao.jpg",
    heroAlt: "Salão da Rosa Buffet montado com mesas e lustre, usado também para eventos corporativos",
    intro: [
      "A Rosa Buffet recebe confraternizações, lançamentos e conferências no seu salão próprio, na Rua São João, 310, Cidade de Deus, em Manaus — a mesma estrutura climatizada usada em casamentos e festas de 15 anos, com camarim, segurança para os carros e buffet completo.",
      "Para evento corporativo, os Pacotes Premium e Gold servem de base: cerimonial e organização do evento, salão climatizado com data show e tela, estrutura de som e iluminação, buffet com pratos quentes e acompanhamentos, e cabine fotográfica. Como cada evento corporativo tem formato próprio (coquetel, jantar, lançamento), o ideal é conversar com a equipe para ajustar o pacote à ocasião.",
      "Os valores dos pacotes seguem as faixas de convidados do simulador; para formatos fora do padrão de festa, o orçamento é sob consulta.",
    ],
    packageSlugs: ["premium", "gold"],
    gallery: [
      { src: "/images/eventos/hero-salao.jpg", alt: "Salão da Rosa Buffet montado com mesas e lustre" },
      { src: "/images/eventos/salao-15-anos.jpg", alt: "Salão da Rosa Buffet preparado para evento" },
      { src: "/images/eventos/quinze-anos-quadro.jpg", alt: "Detalhe de decoração do salão da Rosa Buffet" },
    ],
    faq: [
      {
        question: "A Rosa Buffet atende eventos corporativos?",
        answer:
          "Sim, o salão recebe confraternizações, lançamentos de produtos, conferências e outros eventos corporativos, com estrutura de data show, tela, som e iluminação.",
      },
      {
        question: "O salão tem estrutura para apresentações?",
        answer:
          "Sim, o pacote inclui data show e tela, caixa de som e microfone sem fio, além de iluminação para o ambiente.",
      },
      {
        question: "Existe um pacote específico para evento corporativo?",
        answer:
          "Não existe um pacote fechado só para corporativo — usamos como base os Pacotes Premium e Gold e ajustamos com a equipe conforme o formato do seu evento. Fale pelo WhatsApp para montar o orçamento.",
      },
      {
        question: "Como funciona o orçamento para evento corporativo?",
        answer:
          "Como o formato varia bastante (coquetel, jantar, lançamento), o orçamento é conversado direto com a equipe pelo WhatsApp. Você também pode simular uma faixa de valor em /orcamento com base nos pacotes padrão.",
      },
      {
        question: "Como agendar uma visita ao salão antes de decidir?",
        answer:
          "Pela página /visita, escolhendo dia e horário livre para conhecer o espaço antes de fechar o evento.",
      },
    ],
  },
  {
    slug: "cha-revelacao-manaus",
    h1: "Chá Revelação em Manaus",
    introHeading: "Como é um chá revelação na Rosa Buffet",
    metaTitle: "Chá Revelação em Manaus | Rosa Buffet",
    metaDescription:
      "Chá revelação em Manaus com salão próprio, decoração e buffet completos. Celebre a revelação do bebê com a Rosa Buffet, na Cidade de Deus.",
    heroImage: "/images/eventos/aniversario.jpg",
    heroAlt: "Painel dourado e cadeiras clássicas no salão da Rosa Buffet",
    intro: [
      "A Rosa Buffet recebe chá revelação no seu salão próprio, na Rua São João, 310, Cidade de Deus, em Manaus, com decoração, bolo e buffet organizados para transformar o momento da revelação em uma celebração completa.",
      "Os Pacotes Premium e Gold servem de base para o chá revelação: salão climatizado com decoração, mesa imperial dourada, bolo verdadeiro, buffet com pratos quentes e acompanhamentos, DJ com som e iluminação, e cabine fotográfica para registrar o momento. Como o chá revelação costuma reunir menos convidados que uma festa de 15 anos ou casamento, o formato exato é ajustado com a equipe.",
      "O orçamento considera a quantidade de convidados e o formato desejado — fale com a equipe para ajustar o pacote à sua celebração.",
    ],
    packageSlugs: ["premium", "gold"],
    gallery: [
      { src: "/images/eventos/aniversario.jpg", alt: "Painel dourado e cadeiras clássicas no salão da Rosa Buffet" },
      { src: "/images/eventos/hero-salao.jpg", alt: "Salão da Rosa Buffet montado com mesas e lustre" },
      { src: "/images/eventos/salao-15-anos.jpg", alt: "Salão da Rosa Buffet preparado para festa" },
    ],
    faq: [
      {
        question: "A Rosa Buffet organiza chá revelação?",
        answer:
          "Sim, o chá revelação é montado no salão próprio da Rosa Buffet, com decoração, bolo, buffet e DJ, usando como base os Pacotes Premium e Gold.",
      },
      {
        question: "Existe um pacote específico para chá revelação?",
        answer:
          "Não existe um pacote fechado só para chá revelação — usamos os Pacotes Premium e Gold como base e ajustamos com a equipe conforme o número de convidados e o formato da celebração.",
      },
      {
        question: "Quantos convidados cabem em um chá revelação?",
        answer:
          "O simulador em /orcamento calcula valores para as faixas de 80, 100, 120 e 150 convidados. Para grupos menores ou formatos diferentes, o orçamento é conversado direto com a equipe.",
      },
      {
        question: "Como faço o orçamento do chá revelação?",
        answer:
          "Fale com a equipe pelo WhatsApp para ajustar o pacote ao seu chá revelação, ou simule uma faixa de valor em /orcamento com base nos pacotes padrão.",
      },
      {
        question: "Como reservo a data?",
        answer:
          "A reserva é garantida com um sinal de R$ 500. Dá para agendar uma visita ao salão em /visita antes de decidir.",
      },
    ],
  },
];

export function getFesta(slug: string): FestaContent | undefined {
  return festas.find((f) => f.slug === slug);
}
