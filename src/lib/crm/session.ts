import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "crm_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 dias

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não configurada.`);
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", requiredEnv("SESSION_SECRET")).update(payload).digest("base64url");
}

// Compara em tempo constante. Usa o HMAC de cada lado (sempre mesmo tamanho)
// em vez de comparar os valores originais diretamente, então strings de
// tamanhos diferentes não vazam informação de timing nem quebram
// timingSafeEqual (que exige buffers do mesmo tamanho).
function constantTimeEqual(a: string, b: string): boolean {
  return timingSafeEqual(Buffer.from(sign(a)), Buffer.from(sign(b)));
}

export function createSessionCookieValue(): string {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function isValidSessionCookieValue(value: string | undefined): boolean {
  if (!value) return false;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return false;

  const expectedBuf = Buffer.from(sign(encoded));
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  if (!timingSafeEqual(expectedBuf, actualBuf)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(encoded, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export function checkPassword(candidate: string): boolean {
  return constantTimeEqual(candidate, requiredEnv("CRM_PASSWORD"));
}
