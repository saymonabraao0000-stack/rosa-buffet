import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, isValidSessionCookieValue } from "@/lib/crm/session";
import { exchangeCodeForTokens } from "@/lib/google-calendar";

const STATE_COOKIE_NAME = "crm_google_state";

export const dynamic = "force-dynamic";

// Callback do OAuth do Google Agenda (item 14). Exige sessão do CRM (mesmo
// padrão de conectar/route.ts). Valida o `state` contra o cookie curto
// gravado em /crm/google/conectar (proteção CSRF do fluxo OAuth), troca o
// `code` por tokens e redireciona de volta para Configurações.
export async function GET(request: Request) {
  const jar = await cookies();
  if (!isValidSessionCookieValue(jar.get(SESSION_COOKIE_NAME)?.value)) {
    redirect("/crm/login");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = jar.get(STATE_COOKIE_NAME)?.value;
  const errorParam = url.searchParams.get("error");

  const response = NextResponse.redirect(new URL("/crm/configuracoes", url.origin));
  // Cookie de state é de uso único — apaga já, dê certo ou não.
  response.cookies.set(STATE_COOKIE_NAME, "", { maxAge: 0, path: "/crm/google" });

  if (errorParam) {
    // Ex.: usuário cancelou a tela de consentimento.
    response.headers.set(
      "Location",
      `/crm/configuracoes?google=erro`,
    );
    return response;
  }

  if (!code || !state || !savedState || state !== savedState) {
    response.headers.set("Location", `/crm/configuracoes?google=erro`);
    return response;
  }

  const result = await exchangeCodeForTokens(code, url.origin);
  response.headers.set(
    "Location",
    result.ok ? `/crm/configuracoes?google=ok` : `/crm/configuracoes?google=erro`,
  );
  return response;
}
