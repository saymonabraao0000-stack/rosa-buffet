import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, isValidSessionCookieValue } from "./session";

/**
 * Confirma a sessão do CRM dentro de cada Server Action/página protegida.
 *
 * O proxy.ts já bloqueia /crm/** sem sessão válida, mas Server Actions não
 * herdam essa proteção automaticamente (são POSTs para a rota onde são
 * chamadas — um refactor que exclua essa rota do matcher do proxy remove a
 * proteção sem avisar). Por isso cada ação sensível chama isto de novo.
 */
export async function requireSession(): Promise<void> {
  const jar = await cookies();
  if (!isValidSessionCookieValue(jar.get(SESSION_COOKIE_NAME)?.value)) {
    redirect("/crm/login");
  }
}
