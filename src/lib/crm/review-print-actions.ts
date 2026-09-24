"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "./require-session";
import {
  deleteReviewPrint,
  insertReviewPrint,
  toggleReviewPrintVisible,
  type ValidationError,
} from "./review-prints";

const ERROR_MESSAGES: Record<ValidationError, string> = {
  mime_invalido: "Formato de imagem não suportado.",
  arquivo_grande: "Arquivo maior que 600 KB.",
  dimensao_invalida: "Dimensões inválidas.",
};

// Recebe UM arquivo por vez (o cliente já redimensiona/comprime no navegador
// e envia um por request, para ficar bem abaixo do limite de 1 MB das
// Server Actions do Next). FormData em vez de argumentos tipados porque o
// Blob/File precisa viajar como multipart.
export async function uploadReviewPrintAction(
  formData: FormData,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireSession();

  const file = formData.get("file");
  const widthRaw = formData.get("width");
  const heightRaw = formData.get("height");

  if (!(file instanceof Blob)) return { ok: false, error: "Arquivo ausente." };

  const width = Number(widthRaw);
  const height = Number(heightRaw);
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return { ok: false, error: "Dimensões ausentes." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = file.type || "application/octet-stream";

  const result = await insertReviewPrint({
    bytes,
    mime,
    width: Math.round(width),
    height: Math.round(height),
  });

  if ("error" in result) {
    return { ok: false, error: ERROR_MESSAGES[result.error] };
  }

  revalidatePath("/crm/depoimentos");
  return { ok: true, id: result.id };
}

export async function toggleReviewPrintVisibleAction(id: string, visivel: boolean): Promise<void> {
  await requireSession();
  await toggleReviewPrintVisible(id, visivel);
  revalidatePath("/crm/depoimentos");
}

export async function deleteReviewPrintAction(id: string): Promise<void> {
  await requireSession();
  await deleteReviewPrint(id);
  revalidatePath("/crm/depoimentos");
}
