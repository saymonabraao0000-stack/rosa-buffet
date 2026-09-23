"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "./require-session";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  checkPassword,
  createSessionCookieValue,
} from "./session";
import * as leads from "./leads";
import * as notes from "./notes";
import type { LeadDetailsInput, LeadStatus, ManualLeadInput } from "./types";

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!password || !checkPassword(password)) {
    return { error: "Senha incorreta." };
  }

  (await cookies()).set(SESSION_COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/crm");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
  redirect("/crm/login");
}

export async function updateLeadStatusAction(
  id: string,
  status: LeadStatus,
  perdidoMotivo?: string,
): Promise<void> {
  await requireSession();
  await leads.updateLeadStatus(id, status, status === "perdido" ? (perdidoMotivo ?? null) : null);
  revalidateLeadPages(id);
}

export async function markSinalPagoAction(id: string, paid: boolean): Promise<void> {
  await requireSession();
  await leads.markSinalPago(id, paid);
  revalidatePath(`/crm/leads/${id}`);
}

export async function addNoteAction(leadId: string, text: string): Promise<void> {
  await requireSession();
  const trimmed = text.trim();
  if (!trimmed) return;
  await notes.addNote(leadId, trimmed);
  revalidatePath(`/crm/leads/${leadId}`);
}

// Lê os campos de <LeadFields> (formulários de novo lead e de edição).
function readLeadDetails(formData: FormData): LeadDetailsInput {
  const nome = String(formData.get("nome") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  if (!nome || !telefone) {
    throw new Error("Nome e telefone são obrigatórios.");
  }
  return {
    nome,
    telefone,
    temaSlug: (formData.get("temaSlug") as string) || null,
    guestRangeSlug: (formData.get("guestRangeSlug") as string) || null,
    dataEvento: (formData.get("dataEvento") as string) || null,
    buffetTierSlug: (formData.get("buffetTierSlug") as string) || null,
  };
}

function revalidateLeadPages(id: string) {
  revalidatePath(`/crm/leads/${id}`);
  revalidatePath("/crm/leads");
  revalidatePath("/crm/agenda");
  revalidatePath("/crm");
}

export async function updateLeadAction(id: string, formData: FormData): Promise<void> {
  await requireSession();
  await leads.updateLeadDetails(id, readLeadDetails(formData));
  revalidateLeadPages(id);
  redirect(`/crm/leads/${id}`);
}

export async function deleteLeadAction(id: string): Promise<void> {
  await requireSession();
  await leads.deleteLead(id);
  revalidateLeadPages(id);
  redirect("/crm/leads");
}

export async function createManualLeadAction(formData: FormData): Promise<void> {
  await requireSession();

  const input: ManualLeadInput = {
    ...readLeadDetails(formData),
    status: ((formData.get("status") as string) || "novo") as ManualLeadInput["status"],
  };

  const { id } = await leads.createManualLead(input);
  revalidatePath("/crm/leads");
  redirect(`/crm/leads/${id}`);
}
