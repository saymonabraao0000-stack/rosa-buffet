import type { Metadata } from "next";
import PartyQuiz from "@/components/quiz/PartyQuiz";
import { getBookedDates } from "@/lib/crm/leads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Simule o orçamento da sua festa",
  description:
    "Responda algumas perguntas sobre tema, convidados e estilo do evento e receba uma estimativa de valor para a sua festa com a Rosa Buffet.",
  alternates: {
    canonical: "/orcamento",
  },
  openGraph: {
    title: "Simule o orçamento da sua festa | Rosa Buffet",
    description:
      "Monte o projeto da sua festa em poucos passos e receba uma estimativa de valor na hora.",
  },
};

export default async function OrcamentoPage() {
  const bookedDates = await getBookedDates();
  return <PartyQuiz bookedDates={bookedDates} />;
}
