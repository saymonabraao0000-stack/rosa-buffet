import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// Gerado em build (necessário para a exportação estática do GitHub Pages).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
