"use server";

// Ações públicas chamadas pelo quiz (/orcamento) — sem requireSession(), de
// propósito: quem está respondendo o quiz não está logado no CRM.
import { createLead, updateLeadProgress } from "@/lib/crm/leads";
import type { LeadProgressPatch } from "@/lib/crm/types";

export async function createLeadAction(input: {
  nome: string;
  telefone: string;
}): Promise<{ id: string | null }> {
  try {
    const { id } = await createLead(input);
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
