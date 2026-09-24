"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireSession } from "./require-session";
import {
  createTestimonialRequest,
  deleteTestimonial,
  getLeadNomeForTestimonial,
  setTestimonialStatus,
  submitTestimonialResponse,
} from "./testimonials";
import type { TestimonialStatus } from "./testimonials";

// Ação protegida: gera o pedido de depoimento pro lead (festa fechada) e
// devolve o link absoluto pronto para copiar/enviar. Host via headers(),
// mesmo padrão de src/lib/quiz/actions.ts (createLeadAction).
export async function requestTestimonialAction(
  leadId: string,
): Promise<{ ok: true; link: string } | { ok: false; error: string }> {
  await requireSession();

  const nome = await getLeadNomeForTestimonial(leadId);
  if (!nome) return { ok: false, error: "Lead não encontrado." };

  const { token } = await createTestimonialRequest({ leadId, nome });

  const host = (await headers()).get("host") ?? "";
  const origin = host ? `${host.startsWith("localhost") ? "http" : "https"}://${host}` : "";
  const link = `${origin}/depoimento/${token}`;

  revalidatePath(`/crm/leads/${leadId}`);
  revalidatePath("/crm/depoimentos");

  return { ok: true, link };
}

export async function approveTestimonialAction(id: string): Promise<void> {
  await requireSession();
  await setTestimonialStatus(id, "aprovado" satisfies TestimonialStatus);
  revalidatePath("/crm/depoimentos");
}

export async function rejectTestimonialAction(id: string): Promise<void> {
  await requireSession();
  await setTestimonialStatus(id, "recusado" satisfies TestimonialStatus);
  revalidatePath("/crm/depoimentos");
}

export async function deleteTestimonialAction(id: string): Promise<void> {
  await requireSession();
  await deleteTestimonial(id);
  revalidatePath("/crm/depoimentos");
}

// Ação PÚBLICA: quem responde o formulário em /depoimento/[token] não está
// logado no CRM (mesma lógica de src/lib/quiz/actions.ts). Honeypot simples
// (campo "site" invisível — robô preenche, humano nunca vê) e validações de
// tamanho/nota/consentimento contra spam e envio incompleto.
export async function submitTestimonialAction(
  token: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Honeypot: se veio preenchido, finge sucesso sem gravar nada.
  const honeypot = String(formData.get("site") ?? "").trim();
  if (honeypot) return { ok: true };

  const nome = String(formData.get("nome") ?? "").trim();
  const texto = String(formData.get("texto") ?? "").trim();
  const notaRaw = String(formData.get("nota") ?? "");
  const nota = Number(notaRaw);
  const consentimento = formData.get("consentimento");

  if (!nome) return { ok: false, error: "Informe seu nome." };
  if (!consentimento) return { ok: false, error: "É preciso autorizar a publicação para enviar." };
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    return { ok: false, error: "Escolha uma nota de 1 a 5 estrelas." };
  }
  if (texto.length < 10 || texto.length > 1000) {
    return { ok: false, error: "O depoimento precisa ter entre 10 e 1000 caracteres." };
  }

  const result = await submitTestimonialResponse(token, { nome, nota, texto });
  if (!result.ok) {
    return {
      ok: false,
      error:
        result.error === "ja_respondido"
          ? "Esse depoimento já foi enviado, obrigado!"
          : "Link inválido ou expirado.",
    };
  }

  return { ok: true };
}
