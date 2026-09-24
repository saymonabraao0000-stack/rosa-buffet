"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "./require-session";
import { markAvaliacaoPedida } from "./pos-festa";

// Server Action do lembrete "Pedir avaliação" do dashboard — grava
// avaliacao_pedida_em, disparada tanto pelo botão "Já pedi" quanto pelo
// próprio clique no link do WhatsApp (via onClick, sem bloquear a navegação).
export async function markAvaliacaoPedidaAction(id: string): Promise<void> {
  await requireSession();
  await markAvaliacaoPedida(id);
  revalidatePath("/crm");
  revalidatePath(`/crm/leads/${id}`);
}
