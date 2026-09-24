import "server-only";
import { NextResponse } from "next/server";
import { isValidCronToken } from "@/lib/cron-auth";
import { coletarAlertaSemResposta } from "@/lib/crm/sem-resposta";
import { notifyText } from "@/lib/notify";
import { siteConfig } from "@/lib/site-config";
import { hasAnyPushSubscription } from "@/lib/webpush";

// Rota interna do alerta de lead sem resposta. Chamada só pelo scheduled()
// do custom-worker.ts a cada 15 minutos, autenticada pelo token do cron.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isValidCronToken(request.headers.get("x-cron-token"))) {
    return NextResponse.json({ enviado: false, erro: "token inválido" }, { status: 401 });
  }

  // Sem nenhum jeito de avisar (nem push nem ntfy), não adianta marcar os
  // leads como avisados.
  const podeAvisar = (await hasAnyPushSubscription()) || Boolean(process.env.NTFY_TOPIC);
  if (!podeAvisar) return NextResponse.json({ enviado: false, motivo: "sem inscrição de push nem NTFY_TOPIC" });

  const alerta = await coletarAlertaSemResposta();
  if (!alerta) return NextResponse.json({ enviado: false });

  const enviado = await notifyText(alerta.titulo, alerta.texto, `${siteConfig.url}${alerta.caminho}`);
  return NextResponse.json({ enviado });
}
