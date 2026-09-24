import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Autenticação das rotas internas chamadas pelo scheduled() do custom-worker.ts
// (resumo diário e alerta de lead sem resposta). Token = HMAC-SHA256(
// SESSION_SECRET, "cron-diario") em base64url — o mesmo que o custom-worker
// calcula; sem secret novo na Cloudflare.
const CRON_TOKEN_MESSAGE = "cron-diario";

function expectedToken(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(CRON_TOKEN_MESSAGE).digest("base64url");
}

/** Comparação em tempo constante, com guarda de tamanho antes do timingSafeEqual. */
export function isValidCronToken(candidate: string | null): boolean {
  const expected = expectedToken();
  if (!expected || !candidate) return false;
  const expectedBuf = Buffer.from(expected);
  const candidateBuf = Buffer.from(candidate);
  if (expectedBuf.length !== candidateBuf.length) return false;
  return timingSafeEqual(expectedBuf, candidateBuf);
}
