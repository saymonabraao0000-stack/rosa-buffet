"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { deleteGoogleEventById, syncLeadToGoogle } from "@/lib/google-calendar";
import { sql } from "@/lib/db/client";
import { requireSession } from "./require-session";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  checkPassword,
  createSessionCookieValue,
} from "./session";
import { clearAttemptsForIp, isIpBlocked, registerFailedAttempt } from "./login-attempts";
import * as leads from "./leads";
import * as notes from "./notes";
import { LEAD_ORIGENS } from "./types";
import type {
  LeadChecklist,
  LeadDetailsInput,
  LeadFinanceiroInput,
  LeadOrigem,
  LeadStatus,
  ManualLeadInput,
} from "./types";

export type LoginState = { error?: string } | undefined;

// Item 6 — trava de login: IP vem do cabeçalho da Cloudflare, com fallback
// pro primeiro valor de x-forwarded-for (proxies genéricos) e "desconhecido"
// como último recurso (nunca deixa a trava quebrar por falta de IP).
function getClientIp(headerList: Awaited<ReturnType<typeof headers>>): string {
  const cfIp = headerList.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "desconhecido";
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const ip = getClientIp(await headers());

  if (await isIpBlocked(ip)) {
    return { error: "Muitas tentativas. Aguarde 15 minutos e tente de novo." };
  }

  const password = String(formData.get("password") ?? "");
  if (!password || !checkPassword(password)) {
    await registerFailedAttempt(ip);
    return { error: "Senha incorreta." };
  }

  await clearAttemptsForIp(ip);

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
  // Google Agenda: entrar/sair de "fechado" cria/apaga o evento. Depois da
  // resposta e sem nunca lançar — o CRM não depende do Google para salvar.
  after(() => syncLeadToGoogle(id));
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
  const origemRaw = (formData.get("origem") as string) || "";
  const origem = (origemRaw in LEAD_ORIGENS ? origemRaw : null) as LeadOrigem | null;
  return {
    nome,
    telefone,
    temaSlug: (formData.get("temaSlug") as string) || null,
    guestRangeSlug: (formData.get("guestRangeSlug") as string) || null,
    dataEvento: (formData.get("dataEvento") as string) || null,
    buffetTierSlug: (formData.get("buffetTierSlug") as string) || null,
    origem,
  };
}

function parseIntOrNull(value: FormDataEntryValue | null): number | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const n = Number.parseInt(str, 10);
  return Number.isFinite(n) ? n : null;
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
  // Mudou a data/nome/tema de uma festa fechada → atualiza o evento no Google.
  after(() => syncLeadToGoogle(id));
  revalidateLeadPages(id);
  redirect(`/crm/leads/${id}`);
}

export async function deleteLeadAction(id: string): Promise<void> {
  await requireSession();
  // O id do evento some junto com o lead — lê antes para apagar no Google.
  const [row] = await sql`select google_event_id from leads where id = ${id}`;
  const googleEventId = (row?.google_event_id as string | null) ?? null;
  await leads.deleteLead(id);
  if (googleEventId) after(() => deleteGoogleEventById(googleEventId));
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

// Item 1 — lembrete de retorno. `retornarEm` nulo limpa o campo.
export async function updateLeadRetornarEmAction(id: string, retornarEm: string | null): Promise<void> {
  await requireSession();
  await leads.updateLeadRetornarEm(id, retornarEm);
  revalidateLeadPages(id);
}

// Item 4 — financeiro da festa.
export async function updateLeadFinanceiroAction(id: string, formData: FormData): Promise<void> {
  await requireSession();
  const input: LeadFinanceiroInput = {
    valorFechado: parseIntOrNull(formData.get("valorFechado")),
    valorSinal: parseIntOrNull(formData.get("valorSinal")),
    valorPago: parseIntOrNull(formData.get("valorPago")) ?? 0,
    pagamentoFinalEm: (formData.get("pagamentoFinalEm") as string) || null,
  };
  await leads.updateLeadFinanceiro(id, input);
  revalidateLeadPages(id);
}

// Item 15 — checklist da festa.
export async function updateLeadChecklistAction(id: string, formData: FormData): Promise<void> {
  await requireSession();
  const numeroFinalConvidados = parseIntOrNull(formData.get("numeroFinalConvidados"));
  const checklist: LeadChecklist = {
    cardapioDefinido: formData.get("cardapioDefinido") === "on",
    bolo: formData.get("bolo") === "on",
    decoracao: formData.get("decoracao") === "on",
    numeroFinalConvidados: numeroFinalConvidados ?? undefined,
    horario: (formData.get("horario") as string) || undefined,
    degustacaoEm: (formData.get("degustacaoEm") as string) || undefined,
    fornecedores: (formData.get("fornecedores") as string) || undefined,
  };
  await leads.updateLeadChecklist(id, checklist);
  revalidateLeadPages(id);
}
