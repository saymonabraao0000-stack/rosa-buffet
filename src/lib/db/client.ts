import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Conexão preguiçosa: só valida DATABASE_URL/cria o cliente na primeira
// consulta de verdade, nunca ao importar o módulo. Isso evita que rotas
// `force-dynamic` (que não devem tocar o banco em build time) quebrem o
// `next build` só porque a env var ainda não foi configurada localmente —
// na Vercel ela já existe antes do build rodar, então isso nunca afeta produção.
let cachedSql: NeonQueryFunction<false, false> | null = null;

function ensureClient(): NeonQueryFunction<false, false> {
  if (!cachedSql) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL não configurada. Rode `vercel env pull .env.local` depois de provisionar o banco (Vercel → projeto rosa-buffet → Storage → Neon).",
      );
    }
    cachedSql = neon(process.env.DATABASE_URL);
  }
  return cachedSql;
}

export const sql: NeonQueryFunction<false, false> = new Proxy(
  (() => {}) as unknown as NeonQueryFunction<false, false>,
  {
    apply(_target, thisArg, args) {
      return Reflect.apply(ensureClient(), thisArg, args);
    },
    get(_target, prop) {
      return Reflect.get(ensureClient(), prop);
    },
  },
);
