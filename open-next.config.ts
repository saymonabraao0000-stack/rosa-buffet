import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Cache só de leitura, servido dos próprios assets do build: as páginas
// estáticas (home, /celebracoes) não usam revalidação por tempo, e as do
// /crm e /orcamento são dinâmicas. Dispensa ativar o R2.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
