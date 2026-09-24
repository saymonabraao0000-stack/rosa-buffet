import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { SESSION_COOKIE_NAME, isValidSessionCookieValue } from "@/lib/crm/session";
import { getAuthUrl, isGoogleConfigured } from "@/lib/google-calendar";

// Início do OAuth do Google Agenda (item 14). Exige sessão do CRM — mesma
// checagem de cookie de require-session.ts, repetida aqui em vez de chamar
// requireSession() porque essa faz redirect() para /crm/login, que dentro de
// uma Route Handler (GET) também funciona (o redirect é uma exceção especial
// que o Next converte em resposta de redirecionamento).
const STATE_COOKIE_NAME = "crm_google_state";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const jar = await cookies();
  if (!isValidSessionCookieValue(jar.get(SESSION_COOKIE_NAME)?.value)) {
    redirect("/crm/login");
  }

  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/crm/configuracoes?google=erro", request.url));
  }

  const state = randomBytes(24).toString("base64url");
  const origin = new URL(request.url).origin;
  const authUrl = getAuthUrl(origin, state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600, // 10 minutos — só precisa sobreviver à ida e volta no Google
    path: "/crm/google",
  });
  return response;
}
