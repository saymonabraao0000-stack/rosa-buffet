"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "./require-session";
import { setSetting, type ModelosWhatsapp } from "./settings";

export type SaveSettingState = { ok?: boolean; error?: string } | undefined;

export async function saveCondicoesPagamentoAction(
  _prevState: SaveSettingState,
  formData: FormData,
): Promise<SaveSettingState> {
  await requireSession();
  const value = String(formData.get("condicoes_pagamento") ?? "").trim();
  await setSetting("condicoes_pagamento", value);
  revalidatePath("/crm/configuracoes");
  return { ok: true };
}

export async function saveLinkAvaliacaoAction(
  _prevState: SaveSettingState,
  formData: FormData,
): Promise<SaveSettingState> {
  await requireSession();
  const value = String(formData.get("link_avaliacao_google") ?? "").trim();
  await setSetting("link_avaliacao_google", value);
  revalidatePath("/crm/configuracoes");
  return { ok: true };
}

export async function saveModelosWhatsappAction(
  _prevState: SaveSettingState,
  formData: FormData,
): Promise<SaveSettingState> {
  await requireSession();
  const value: ModelosWhatsapp = {
    primeiroContato: String(formData.get("primeiroContato") ?? "").trim(),
    retomarSimulacao: String(formData.get("retomarSimulacao") ?? "").trim(),
    cobrarOrcamento: String(formData.get("cobrarOrcamento") ?? "").trim(),
    reservaConfirmada: String(formData.get("reservaConfirmada") ?? "").trim(),
    lembreteSaldo: String(formData.get("lembreteSaldo") ?? "").trim(),
    posFesta: String(formData.get("posFesta") ?? "").trim(),
  };
  await setSetting("modelos_whatsapp", value);
  revalidatePath("/crm/configuracoes");
  return { ok: true };
}
