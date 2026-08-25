/**
 * Subcaminho onde o site é servido.
 *
 * No GitHub Pages o site fica em /rosa-buffet (nome do repositório); na Vercel
 * e em desenvolvimento, na raiz. O Next já prefixa sozinho os links (`Link`) e
 * os arquivos de build, mas NÃO prefixa o que é escrito à mão, como o ícone do
 * site, nem o `src` de imagens quando o otimizador está desligado — daí este
 * valor ser exportado para uso explícito.
 */
export const basePath = process.env.GITHUB_PAGES === "1" ? "/rosa-buffet" : "";

/** Prefixa um caminho absoluto de /public com o subcaminho do site. */
export function withBasePath(path: string) {
  return path.startsWith("/") ? `${basePath}${path}` : path;
}
