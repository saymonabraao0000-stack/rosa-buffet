"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Cloudflare Web Analytics (sem cookies, não precisa de aviso). O token é
// público por natureza — vai no HTML de qualquer jeito. Painel: Cloudflare →
// Analytics & Logs → Web Analytics → rosabuffeteventos.com.br.
const TOKEN = "03457e6c8c8342a59163074637c54ace";

/** Fica fora do /crm para os acessos da equipe não contarem como visita. */
export default function CloudflareAnalytics() {
  const pathname = usePathname();
  if (pathname?.startsWith("/crm")) return null;
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: TOKEN })}
      strategy="afterInteractive"
    />
  );
}
