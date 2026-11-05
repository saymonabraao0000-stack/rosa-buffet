import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Cache só de leitura, servido dos próprios assets do build: as páginas
// estáticas (home, /celebracoes) não usam revalidação por tempo, e as do
// /crm e /orcamento são dinâmicas. Dispensa ativar o R2.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  // NÃO religar (2026-11-05). Com a interceptação ligada, o pré-carregamento
  // do Next 16 (pedido de "segmento", cabeçalho Next-Router-Segment-Prefetch)
  // recebia a página inteira em vez do segmento, e o navegador repetia o pedido
  // de / e /celebracoes sem parar (~200 por segundo por aba aberta). Isso
  // estourou o limite de 100 mil pedidos/dia do plano grátis em 01/11 e 04/11.
  enableCacheInterception: false,
});
