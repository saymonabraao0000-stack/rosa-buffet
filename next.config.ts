import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Eventos corporativos e chá revelação saíram do catálogo em 2026-09-26
  // (o salão não faz esse tipo de festa). Redireciona permanente pra quem
  // ainda tiver o link antigo indexado ou salvo.
  async redirects() {
    return [
      {
        source: "/festas/eventos-corporativos-manaus",
        destination: "/festas",
        permanent: true,
      },
      {
        source: "/festas/cha-revelacao-manaus",
        destination: "/festas",
        permanent: true,
      },
    ];
  },
  // O service worker do Web Push (public/crm-sw.js) precisa ser buscado de
  // novo a cada visita — sem isso o navegador pode servir uma versão velha
  // do cache e nunca aplicar uma correção nele.
  async headers() {
    return [
      {
        source: "/crm-sw.js",
        headers: [
          { key: "Content-Type", value: "text/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
