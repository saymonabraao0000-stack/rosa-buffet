import type { Lead } from "./types";

// `current_step` guarda a ÚLTIMA etapa respondida no simulador. Responder o
// pacote já leva direto à tela de resultado, então "pacote" (ou "resultado",
// em leads antigos) = viu o orçamento. Qualquer outra = parou no meio.
export const QUIZ_DONE_STEPS = ["pacote", "resultado"] as const;

const STEP_LABELS: Record<string, string> = {
  contato: "Só deixou o contato",
  tema: "Parou depois do tema",
  convidados: "Parou depois dos convidados",
  data: "Parou depois da data",
  pacote: "Viu o orçamento",
  resultado: "Viu o orçamento",
};

export function isQuizIncomplete(lead: Lead): boolean {
  return (
    lead.source === "quiz" &&
    !(QUIZ_DONE_STEPS as readonly string[]).includes(lead.currentStep ?? "contato")
  );
}

export function quizStepLabel(lead: Lead): string | undefined {
  if (lead.source !== "quiz") return undefined;
  return STEP_LABELS[lead.currentStep ?? "contato"] ?? lead.currentStep ?? undefined;
}
