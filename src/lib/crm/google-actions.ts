"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "./require-session";
import { disconnectGoogle, syncAllFechados } from "@/lib/google-calendar";

export type GoogleActionState = { ok?: boolean; error?: string; mensagem?: string } | undefined;

export async function disconnectGoogleAction(): Promise<void> {
  await requireSession();
  await disconnectGoogle();
  revalidatePath("/crm/configuracoes");
}

export async function syncAllFechadosAction(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: GoogleActionState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData?: FormData,
): Promise<GoogleActionState> {
  await requireSession();
  try {
    const { total, ok, falhas } = await syncAllFechados();
    if (total === 0) {
      return { ok: true, mensagem: "Nenhuma festa fechada com data futura para sincronizar." };
    }
    return {
      ok: falhas === 0,
      mensagem:
        falhas === 0
          ? `${ok} de ${total} festa(s) sincronizada(s).`
          : `${ok} de ${total} sincronizada(s), ${falhas} com falha.`,
    };
  } catch (err) {
    console.error("syncAllFechadosAction falhou:", err);
    return { ok: false, error: "Falha ao sincronizar com o Google Agenda." };
  }
}
