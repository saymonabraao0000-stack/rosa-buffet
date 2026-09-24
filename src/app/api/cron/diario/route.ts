import "server-only";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { buildDailySummary } from "@/lib/crm/daily";
import { notifyText } from "@/lib/notify";
import { siteConfig } from "@/lib/site-config";

// Rota interna do resumo diário (item 13 do plano — Planos/crm-melhorias-2026-09-24.md).
// Chamada só pelo scheduled() do Custom Worker (ver custom-worker.ts na raiz),
// via WORKER_SELF_REFERENCE, uma vez por dia às 8h de Manaus. Precisa de
// force-dynamic: nada aqui pode ser pré-renderizado no build.
export const dynamic = "force-dynamic";

const CRON_TOKEN_MESSAGE = "cron-diario";

// Token = HMAC-SHA256(SESSION_SECRET, "cron-diario") em base64url — sem
// secret novo, reaproveita o mesmo SESSION_SECRET do cookie de sessão do CRM.
function expectedToken(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(CRON_TOKEN_MESSAGE).digest("base64url");
}

// Comparação em tempo constante (mesmo padrão de crm/session.ts), com guarda
// de tamanho antes do timingSafeEqual (que exige buffers do mesmo tamanho).
function isValidToken(candidate: string | null): boolean {
  const expected = expectedToken();
  if (!expected || !candidate) return false;
  const expectedBuf = Buffer.from(expected);
  const candidateBuf = Buffer.from(candidate);
  if (expectedBuf.length !== candidateBuf.length) return false;
  return timingSafeEqual(expectedBuf, candidateBuf);
}

export async function POST(request: Request) {
  const token = request.headers.get("x-cron-token");
  if (!isValidToken(token)) {
    return NextResponse.json({ enviado: false, erro: "token inválido" }, { status: 401 });
  }

  const resumo = await buildDailySummary();
  if (!resumo) {
    return NextResponse.json({ enviado: false });
  }

  const enviado = await notifyText(resumo.titulo, resumo.texto, `${siteConfig.url}/crm`);
  return NextResponse.json({ enviado });
}
