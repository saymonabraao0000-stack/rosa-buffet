"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db/client";
import { requireSession } from "./require-session";
import { getVapidPublicKey, sendPushToAll } from "@/lib/webpush";

export type PushDevice = {
  id: string;
  aparelho: string | null;
  criadoEm: string;
  ultimoOkEm: string | null;
  ultimoErro: string | null;
};

/** Chave pública VAPID, para `pushManager.subscribe({ applicationServerKey })` no navegador. Protegida: só chamada de dentro do CRM logado. */
export async function getPushPublicKeyAction(): Promise<string> {
  await requireSession();
  return getVapidPublicKey();
}

export type SubscribeState = { ok: boolean; error?: string } | undefined;

/** Salva a inscrição de push criada no navegador. `endpoint`/p256dh/auth vêm de `subscription.toJSON()`. */
export async function subscribePushAction(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  aparelho: string;
}): Promise<SubscribeState> {
  await requireSession();

  if (!input.endpoint || !input.p256dh || !input.auth) {
    return { ok: false, error: "Inscrição inválida." };
  }

  try {
    await sql`
      insert into push_subscriptions (endpoint, p256dh, auth, aparelho)
      values (${input.endpoint}, ${input.p256dh}, ${input.auth}, ${input.aparelho})
      on conflict (endpoint) do update set
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        aparelho = excluded.aparelho,
        ultimo_erro = null
    `;
  } catch (err) {
    console.error("subscribePushAction falhou:", err);
    return { ok: false, error: "Não deu para salvar a inscrição." };
  }

  revalidatePath("/crm/configuracoes");
  revalidatePath("/crm");
  return { ok: true };
}

/** Remove a inscrição deste aparelho (chamado ao desativar os avisos no próprio aparelho). */
export async function unsubscribePushAction(endpoint: string): Promise<void> {
  await requireSession();
  if (!endpoint) return;
  await sql`delete from push_subscriptions where endpoint = ${endpoint}`;
  revalidatePath("/crm/configuracoes");
  revalidatePath("/crm");
}

/** Remove um aparelho da lista, pelo id (botão "Remover" em Configurações). */
export async function removePushDeviceAction(id: string): Promise<void> {
  await requireSession();
  if (!id) return;
  await sql`delete from push_subscriptions where id = ${id}`;
  revalidatePath("/crm/configuracoes");
  revalidatePath("/crm");
}

export async function listPushDevicesAction(): Promise<PushDevice[]> {
  await requireSession();
  const rows = (await sql`
    select id, aparelho, created_at, ultimo_ok_em, ultimo_erro
    from push_subscriptions
    order by created_at desc
  `) as { id: string; aparelho: string | null; created_at: string; ultimo_ok_em: string | null; ultimo_erro: string | null }[];
  return rows.map((r) => ({
    id: r.id,
    aparelho: r.aparelho,
    criadoEm: r.created_at,
    ultimoOkEm: r.ultimo_ok_em,
    ultimoErro: r.ultimo_erro,
  }));
}

export type TestPushState = { ok: boolean; enviados?: number; falhas?: number; error?: string } | undefined;

export async function sendTestPushAction(): Promise<TestPushState> {
  await requireSession();
  try {
    const { enviados, falhas } = await sendPushToAll({
      title: "Teste - Rosa Buffet",
      body: "Se você recebeu isso, os avisos no celular estão funcionando.",
      tag: "teste",
    });
    if (enviados === 0 && falhas === 0) {
      return { ok: false, error: "Nenhum aparelho cadastrado ainda." };
    }
    return { ok: enviados > 0, enviados, falhas };
  } catch (err) {
    console.error("sendTestPushAction falhou:", err);
    return { ok: false, error: "Falha ao enviar o teste." };
  }
}
