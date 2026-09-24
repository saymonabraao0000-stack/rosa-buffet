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
}): Promise<{ id: string | null }> {
  try {
    const { id } = await createLead(input);
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
