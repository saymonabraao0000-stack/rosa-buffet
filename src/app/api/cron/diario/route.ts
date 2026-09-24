import "server-only";
import { NextResponse } from "next/server";
import { isValidCronToken } from "@/lib/cron-auth";
import { buildDailySummary } from "@/lib/crm/daily";
import { notifyText } from "@/lib/notify";
import { siteConfig } from "@/lib/site-config";

// Rota interna do resumo diário (item 13 do plano — Planos/crm-melhorias-2026-09-24.md).
// Chamada só pelo scheduled() do Custom Worker (ver custom-worker.ts na raiz),
// via WORKER_SELF_REFERENCE, uma vez por dia às 8h de Manaus. Precisa de
// force-dynamic: nada aqui pode ser pré-renderizado no build.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = request.headers.get("x-cron-token");
  if (!isValidCronToken(token)) {
    return NextResponse.json({ enviado: false, erro: "token inválido" }, { status: 401 });
  }

  const resumo = await buildDailySummary();
  if (!resumo) {
    return NextResponse.json({ enviado: false });
  }

  const enviado = await notifyText(resumo.titulo, resumo.texto, `${siteConfig.url}/crm`);
  return NextResponse.json({ enviado });
}
