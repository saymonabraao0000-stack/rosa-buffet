import type { NextConfig } from "next";
import { basePath } from "./src/lib/base-path";

/**
 * Publicação no GitHub Pages (workflow .github/workflows/github-pages.yml):
 * exporta o site como arquivos estáticos, servido sob o subcaminho do
 * repositório.
 *
 * - `trailingSlash` faz cada rota virar uma pasta com index.html, que é o
 *   formato que o GitHub Pages serve sem tropeço.
 * - o loader de imagens substitui o otimizador do Next (que precisa de
 *   servidor) e acrescenta o subcaminho ao src das fotos.
 *
 * Fora do Pages (Vercel e `npm run dev`) nada muda: o site continua servido na
 * raiz e com as imagens otimizadas.
 */
const isGithubPages = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? {
        output: "export" as const,
        basePath,
        trailingSlash: true,
        images: {
          loader: "custom" as const,
          loaderFile: "./src/lib/pages-image-loader.ts",
        },
      }
    : {
        images: {
          remotePatterns: [
            {
              protocol: "https",
              hostname: "images.unsplash.com",
              pathname: "/**",
            },
          ],
        },
      }),
};

export default nextConfig;
