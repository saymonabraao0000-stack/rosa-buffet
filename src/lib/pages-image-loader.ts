import { withBasePath } from "@/lib/base-path";

/**
 * Loader de imagens usado na exportação estática (GitHub Pages).
 *
 * Serve o arquivo original de /public, sem redimensionar — não há servidor de
 * otimização —, apenas acrescentando o subcaminho do site. É o que `unoptimized`
 * faria, exceto que `unoptimized` ignora o subcaminho e quebra as fotos.
 */
export default function pagesImageLoader({ src }: { src: string }) {
  return withBasePath(src);
}
