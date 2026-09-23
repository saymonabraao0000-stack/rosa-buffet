import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, isValidSessionCookieValue } from "./session";

/**
 * Confirma a sessão do CRM dentro de cada página e Server Action protegida.
 *
 * Não existe proxy.ts/middleware: o adaptador da Cloudflare (OpenNext) não
 * suporta o proxy em runtime Node do Next 16. A proteção do /crm é toda esta
 * checagem — no layout de (protected), no topo de cada página (o layout não
 * roda de novo em navegação client-side) e dentro de cada Server Action
 * sensível (Server Actions não herdam a proteção da página).
 */
export async function requireSession(): Promise<void> {
  const jar = await cookies();
  if (!isValidSessionCookieValue(jar.get(SESSION_COOKIE_NAME)?.value)) {
    redirect("/crm/login");
  }
}
