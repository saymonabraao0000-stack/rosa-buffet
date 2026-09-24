"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "./require-session";
import {
  createVisitaManual,
  updateVisitaStatus,
  type VisitaStatus,
  type CreateVisitaResult,
} from "@/lib/visitas";

// Server Actions do CRM para visitas ao salão — protegidas com
// requireSession(), separadas de agenda-actions.ts (outro agente mexe em
// arquivos vizinhos ao mesmo tempo).

export async function updateVisitaStatusAction(id: string, status: VisitaStatus, leadId?: string | null): Promise<void> {
  await requireSession();
  await updateVisitaStatus(id, status);
  revalidatePath("/crm/agenda");
  revalidatePath("/crm/visitas");
  revalidatePath("/crm");
  if (leadId) revalidatePath(`/crm/leads/${leadId}`);
}

export async function createVisitaManualAction(input: {
  leadId: string;
  nome: string;
  telefone: string;
  data: string;
  hora: string;
  observacao?: string;
}): Promise<CreateVisitaResult> {
  await requireSession();
  const result = await createVisitaManual(input);
  if (result.ok) {
    revalidatePath("/crm/agenda");
    revalidatePath("/crm/visitas");
    revalidatePath(`/crm/leads/${input.leadId}`);
    revalidatePath("/crm");
  }
  return result;
}
