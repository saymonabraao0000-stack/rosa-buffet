"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "./require-session";
import * as leads from "./leads";

// Server Actions da Agenda (item 5) e da lista de espera (item 9) — Fase 3a
// do plano de melhorias (Planos/crm-melhorias-2026-09-24.md). Arquivo novo,
// separado de actions.ts (outro agente mexe nele em paralelo).

export async function blockDateAction(data: string, motivo: string): Promise<void> {
  await requireSession();
  await leads.blockDate(data, motivo.trim() || null);
  revalidatePath("/crm/agenda");
}

export async function unblockDateAction(data: string): Promise<void> {
  await requireSession();
  await leads.unblockDate(data);
  revalidatePath("/crm/agenda");
}

export async function addToWaitlistAction(input: {
  leadId: string;
  nome: string;
  telefone: string;
  data: string;
}): Promise<{ id: string }> {
  await requireSession();
  const result = await leads.addToWaitlist(input);
  revalidatePath("/crm/agenda");
  revalidatePath(`/crm/leads/${input.leadId}`);
  revalidatePath("/crm");
  return result;
}

export async function removeFromWaitlistAction(id: string, leadId?: string): Promise<void> {
  await requireSession();
  await leads.removeFromWaitlist(id);
  revalidatePath("/crm/agenda");
  if (leadId) revalidatePath(`/crm/leads/${leadId}`);
  revalidatePath("/crm");
}

export async function markWaitlistAvisadoAction(id: string): Promise<void> {
  await requireSession();
  await leads.markWaitlistAvisado(id);
  revalidatePath("/crm");
  revalidatePath("/crm/agenda");
}

export async function markRecompraAvisadaAction(id: string): Promise<void> {
  await requireSession();
  await leads.markRecompraAvisada(id);
  revalidatePath("/crm");
  revalidatePath(`/crm/leads/${id}`);
}
