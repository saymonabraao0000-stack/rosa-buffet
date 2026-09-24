// Custom Worker do OpenNext (ver https://opennext.js.org/cloudflare/howtos/custom-worker):
// reexporta o `fetch` gerado pelo build (`.open-next/worker.js`, criado por
// `npx opennextjs-cloudflare build` — não existe antes disso) e acrescenta o
// handler `scheduled()` do Cron Trigger (item 13 do plano de melhorias —
// Planos/crm-melhorias-2026-09-24.md). `wrangler.jsonc` aponta `main` pra cá.
//
// `scheduled()` chama a rota interna POST /api/cron/diario pelo binding de
// serviço WORKER_SELF_REFERENCE (já existia em wrangler.jsonc, usado só como
// referência a si mesmo), autenticada com um token HMAC derivado de
// SESSION_SECRET — o mesmo segredo do cookie de sessão do CRM, sem precisar
// cadastrar um secret novo na Cloudflare (mesma conta de `route.ts`).
//
// Este arquivo fica de fora do type-check do Next (ver tsconfig.json
// "exclude"): os tipos globais de Workers (Request/ExecutionContext/etc, os
// que `wrangler types` geraria) colidem com a lib "dom" que o resto do
// projeto Next usa. Em vez de instalar `@cloudflare/workers-types` ou gerar
// `cloudflare-env.d.ts` (que traz esses globais e causaria a colisão),
// declaramos aqui só o mínimo local de que este arquivo precisa.
import { createHmac } from "node:crypto";

// @ts-ignore `.open-next/worker.js` só existe depois do build.
import handler from "./.open-next/worker.js";
// Reexporte obrigatório do OpenNext para apps que usam DO Queue / Tag Cache
// (o build sempre gera esses exports, mesmo quando não usados).
// @ts-ignore `.open-next/worker.js` só existe depois do build.
export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";

const CRON_TOKEN_MESSAGE = "cron-diario";

interface SelfFetcher {
  fetch(input: string, init?: { method?: string; headers?: Record<string, string> }): Promise<unknown>;
}

interface CronEnv {
  SESSION_SECRET?: string;
  WORKER_SELF_REFERENCE?: SelfFetcher;
}

interface MinimalExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

async function scheduled(_event: unknown, env: CronEnv, ctx: MinimalExecutionContext): Promise<void> {
  const secret = env.SESSION_SECRET;
  const self = env.WORKER_SELF_REFERENCE;
  if (!secret || !self) {
    console.error("cron diario: SESSION_SECRET ou WORKER_SELF_REFERENCE ausente, pulando.");
    return;
  }

  const token = createHmac("sha256", secret).update(CRON_TOKEN_MESSAGE).digest("base64url");

  ctx.waitUntil(
    self
      .fetch("https://self/api/cron/diario", {
        method: "POST",
        headers: { "x-cron-token": token },
      })
      .catch((err: unknown) => console.error("cron diario: falhou ao chamar a rota", err)),
  );
}

export default {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  fetch: handler.fetch,
  scheduled,
};
