import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
