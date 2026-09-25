// Citações em destaque na seção de depoimentos da home. Transcritas
// fielmente dos prints reais em public/images/depoimentos (trechos cortados
// com "…"; nada inventado). O nome é o que aparece no próprio print.
//   depoimento-03.jpeg — WhatsApp de Bruna Moreira
//   depoimento-02.jpeg — WhatsApp assinado "Kennedy e Débora"
//   depoimento-01.jpeg — Instagram, mensagem assinada "Almilany Portela"

export type TestimonialQuote = { texto: string; nome: string };

export const testimonialQuotes: TestimonialQuote[] = [
  {
    texto:
      "Que festa linda que nos proporcionou, tudo perfeito, equipe maravilhosa, muita gratidão, somente elogios… vocês são demais!",
    nome: "Bruna",
  },
  {
    texto:
      "Todos elogiaram o ambiente, a comida, a música, os profissionais e todo restante da equipe…",
    nome: "Kennedy e Débora",
  },
  {
    texto: "Saiu tudo maravilhoso… tudo o que eu pedi a senhora fez.",
    nome: "Almilany",
  },
];
