"use server";

// Ações públicas chamadas pela página /visita — sem requireSession(), igual
// ao padrão de src/lib/quiz/actions.ts (quem agenda não está logado no CRM).
import { after } from "next/server";
import { getFreeSlotsForRange, createVisita, type CreateVisitaResult } from "@/lib/visitas";
import { sendPushToAll } from "@/lib/webpush";
import type { DiaComHorarios } from "@/lib/visitas";

export async function getFreeSlotsAction(): Promise<DiaComHorarios[]> {
  return getFreeSlotsForRange();
}

export async function createVisitaAction(input: {
  nome: string;
  telefone: string;
  data: string;
  hora: string;
  origem?: string;
  /** Campo isca: só robô de preenchimento automático deixa preenchido. */
  empresa?: string;
  /** Milissegundos entre a etapa de dados aparecer e o envio. */
  elapsedMs?: number;
}): Promise<CreateVisitaResult> {
  // Mesmo padrão anti-spam do simulador (honeypot + tempo mínimo).
  if ((input.empresa && input.empresa.trim().length > 0) || (input.elapsedMs ?? 0) < 2000) {
    console.warn("createVisitaAction: bloqueado por anti-spam");
    return { ok: false, erro: "invalido" };
  }

  const result = await createVisita({
    nome: input.nome,
    telefone: input.telefone,
    data: input.data,
    hora: input.hora,
    origem: input.origem,
  });

  if (result.ok) {
    const primeiroNome = result.visita.nome.trim().split(/\s+/)[0] || "Alguém";
    const [ano, mes, dia] = result.visita.data.split("-");
    const diaSemana = new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "America/Manaus" }).format(
      new Date(`${result.visita.data}T12:00:00`),
    );
    const url = result.visita.leadId
      ? `/crm/leads/${result.visita.leadId}`
      : `/crm/agenda?mes=${ano}-${mes}`;
    // after(): o aviso sai depois da resposta, sem atrasar a tela de sucesso.
    // DISABLE_PUSH=1 (checado dentro de sendPushToAll) evita o toque real
    // durante testes locais.
    after(() =>
      sendPushToAll({
        title: `Visita agendada - ${primeiroNome}`,
        body: `${diaSemana} ${dia}/${mes} às ${result.visita.hora}. Toque para ver.`,
        url,
        tag: "nova-visita",
      }).catch((err) => console.error("createVisitaAction: aviso falhou:", err)),
    );
  }

  return result;
}
