"use server";

// Ações públicas chamadas pelo quiz (/orcamento) — sem requireSession(), de
// propósito: quem está respondendo o quiz não está logado no CRM.
import { after } from "next/server";
import { headers } from "next/headers";
import { createLead, updateLeadProgress } from "@/lib/crm/leads";
import { notifyNewLead } from "@/lib/notify";
import type { LeadProgressPatch } from "@/lib/crm/types";

export async function createLeadAction(input: {
  nome: string;
  telefone: string;
  origem?: string;
  /** Campo isca: só robô de preenchimento automático deixa preenchido. */
  empresa?: string;
  /** Milissegundos entre a etapa de contato aparecer e o envio. */
  elapsedMs?: number;
}): Promise<{ id: string | null }> {
  // Anti-spam silencioso: honeypot preenchido, envio rápido demais, ou
  // nome/telefone fora do formato esperado — trata como robô sem revelar o
  // bloqueio (retorna como se tivesse dado certo, pro quiz seguir normal).
  const digitsOnly = input.telefone.replace(/\D/g, "").length;
  const nomeLen = input.nome.trim().length;
  if (
    (input.empresa && input.empresa.trim().length > 0) ||
    (input.elapsedMs ?? 0) < 2000 ||
    nomeLen < 2 ||
    nomeLen > 80 ||
    digitsOnly < 10 ||
    digitsOnly > 13
  ) {
    console.warn("createLeadAction: bloqueado por anti-spam");
    return { id: null };
  }

  try {
    const { id } = await createLead({
      nome: input.nome,
      telefone: input.telefone,
      origem: input.origem,
    });
    // Endereço de onde a pessoa acessou (domínio ou *.workers.dev), pro link
    // do aviso abrir a ficha no mesmo site.
    const host = (await headers()).get("host");
    const origin = host ? `${host.startsWith("localhost") ? "http" : "https"}://${host}` : "";
    // after(): o aviso sai depois da resposta, sem atrasar o quiz.
    after(() => notifyNewLead({ id, nome: input.nome }, origin));
    return { id };
  } catch (err) {
    console.error("createLeadAction falhou:", err);
    return { id: null };
  }
}

// "Fire and forget": chamada pelo quiz sem await bloqueante — se a rede
// falhar aqui, a pessoa não deve travar no meio do quiz por causa disso.
export async function updateLeadAction(leadId: string, patch: LeadProgressPatch): Promise<void> {
  try {
    await updateLeadProgress(leadId, patch);
  } catch (err) {
    console.error("updateLeadAction falhou:", err);
  }
}
