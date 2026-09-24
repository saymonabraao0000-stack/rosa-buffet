"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "./require-session";
import { setSetting, getDefaultPrecos, type ModelosWhatsapp, type PrecosSetting } from "./settings";
import { partyPackages, guestOptions } from "@/lib/quiz-data";

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

const GUEST_BRACKETS = guestOptions
  .map((g) => g.guests)
  .filter((g): g is number => g != null);

/**
 * Salva a tabela de preços por pacote × faixa de convidados (item 12).
 * Campo vazio = "sob consulta" (a faixa some de `pricesByGuests`, e o
 * cálculo cai no fallback de `getPackagePrice`/`getDefaultPrecos`).
 * Valor inválido (não inteiro ou negativo) é ignorado silenciosamente —
 * mantém o campo como "sob consulta" em vez de quebrar o salvamento.
 */
export async function savePrecosAction(
  _prevState: SaveSettingState,
  formData: FormData,
): Promise<SaveSettingState> {
  await requireSession();

  const value: PrecosSetting = {};
  for (const pkg of partyPackages) {
    const pricesByGuests: Record<number, number> = {};
    for (const guests of GUEST_BRACKETS) {
      const raw = String(formData.get(`preco_${pkg.slug}_${guests}`) ?? "").trim();
      if (raw === "") continue;
      const parsed = Number(raw);
      if (Number.isInteger(parsed) && parsed >= 0) {
        pricesByGuests[guests] = parsed;
      }
    }
    const note = String(formData.get(`nota_${pkg.slug}`) ?? "").trim();
    value[pkg.slug] = { pricesByGuests, note: note || undefined };
  }

  await setSetting("precos", value);
  revalidatePath("/crm/configuracoes");
  revalidatePath("/orcamento");
  return { ok: true };
}

export async function restorePrecosAction(
  _prevState: SaveSettingState,
  _formData: FormData,
): Promise<SaveSettingState> {
  await requireSession();
  await setSetting("precos", getDefaultPrecos());
  revalidatePath("/crm/configuracoes");
  revalidatePath("/orcamento");
  return { ok: true };
}
