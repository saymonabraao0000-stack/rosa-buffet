import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, isValidSessionCookieValue } from "@/lib/crm/session";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/crm/login") {
    return NextResponse.next();
  }

  const hasValidSession = isValidSessionCookieValue(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );
  if (!hasValidSession) {
    return NextResponse.redirect(new URL("/crm/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/crm/:path*",
};
