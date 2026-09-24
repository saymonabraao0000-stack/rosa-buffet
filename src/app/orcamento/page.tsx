import type { Metadata } from "next";
import PartyQuiz from "@/components/quiz/PartyQuiz";
import { getBookedDates } from "@/lib/crm/leads";
import { getDefaultPrecos, getSetting } from "@/lib/crm/settings";
import type { PrecosSetting } from "@/lib/crm/settings";

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
  const [bookedDates, precos] = await Promise.all([
    getBookedDates(),
    getSetting<PrecosSetting>("precos", getDefaultPrecos()),
  ]);
  return <PartyQuiz bookedDates={bookedDates} precos={precos} />;
}
