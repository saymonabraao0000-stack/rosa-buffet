"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "./require-session";
import {
  setSetting,
  getDefaultPrecos,
  DEFAULT_VISITAS_CONFIG,
  type ModelosWhatsapp,
  type PrecosSetting,
  type VisitasConfig,
} from "./settings";
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

export async function saveVisitasConfigAction(
  _prevState: SaveSettingState,
  formData: FormData,
): Promise<SaveSettingState> {
  await requireSession();

  const diasSemana = ["0", "1", "2", "3", "4", "5", "6"]
    .filter((d) => formData.get(`dia_${d}`) != null)
    .map(Number);
  const horaInicio = String(formData.get("horaInicio") ?? DEFAULT_VISITAS_CONFIG.horaInicio);
  const horaFim = String(formData.get("horaFim") ?? DEFAULT_VISITAS_CONFIG.horaFim);
  const duracaoMinutos = Number(formData.get("duracaoMinutos"));
  const antecedenciaMinimaHoras = Number(formData.get("antecedenciaMinimaHoras"));
  const diasFrente = Number(formData.get("diasFrente"));

  const value: VisitasConfig = {
    diasSemana: diasSemana.length > 0 ? diasSemana : DEFAULT_VISITAS_CONFIG.diasSemana,
    horaInicio: /^\d{2}:\d{2}$/.test(horaInicio) ? horaInicio : DEFAULT_VISITAS_CONFIG.horaInicio,
    horaFim: /^\d{2}:\d{2}$/.test(horaFim) ? horaFim : DEFAULT_VISITAS_CONFIG.horaFim,
    duracaoMinutos: Number.isFinite(duracaoMinutos) && duracaoMinutos > 0 ? duracaoMinutos : DEFAULT_VISITAS_CONFIG.duracaoMinutos,
    antecedenciaMinimaHoras:
      Number.isFinite(antecedenciaMinimaHoras) && antecedenciaMinimaHoras >= 0
        ? antecedenciaMinimaHoras
        : DEFAULT_VISITAS_CONFIG.antecedenciaMinimaHoras,
    diasFrente: Number.isFinite(diasFrente) && diasFrente > 0 ? diasFrente : DEFAULT_VISITAS_CONFIG.diasFrente,
    excluirDiasOcupados: formData.get("excluirDiasOcupados") != null,
  };

  await setSetting("visitas_config", value);
  revalidatePath("/crm/configuracoes");
  revalidatePath("/visita");
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
