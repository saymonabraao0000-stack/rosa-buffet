import "server-only";
import { sql } from "@/lib/db/client";
import { getSetting, setSetting } from "@/lib/crm/settings";

/**
 * Web Push nativo (PWA) implementado do zero com Web Crypto (`crypto.subtle`),
 * sem depender de `web-push` (usa `node:crypto` puro, incompatível com o
 * runtime do Cloudflare Workers). Segue RFC 8291 (payload) + RFC 8188
 * (aes128gcm) + RFC 8292 (VAPID). Troca o ntfy.sh (fora do ar por causa da
 * cota 429 nos IPs compartilhados da Cloudflare — ver notify.ts) por push
 * direto do navegador, sem serviço terceiro no meio além do endpoint do
 * próprio provedor (Google/Apple/Mozilla), que nunca recusa por cota.
 *
 * Chaves VAPID: geradas na primeira necessidade (ECDSA P-256 via
 * crypto.subtle.generateKey) e guardadas no setting `webpush_vapid` — sem
 * secret novo na Cloudflare, reusadas sempre depois.
 */

const VAPID_SUBJECT = "mailto:rosabuffet26@gmail.com";
const RECORD_SIZE = 4096;

type VapidStored = {
  publicKey: string; // base64url do ponto não comprimido (65 bytes)
  privateKeyJwk: JsonWebKey;
};

// ---------------------------------------------------------------------------
// base64url helpers (sem Buffer: precisa rodar em Workers)
// ---------------------------------------------------------------------------

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const withPad = padded + "=".repeat(padLength);
  const binary = atob(withPad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

// ---------------------------------------------------------------------------
// HMAC-SHA256 (usado tanto no HKDF quanto na assinatura fica por conta do
// ECDSA nativo — este HMAC é só para os "extract"/"expand" do HKDF)
// ---------------------------------------------------------------------------

async function hmacSha256(keyBytes: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, data as BufferSource);
  return new Uint8Array(sig);
}

/** HKDF-Extract: PRK = HMAC-SHA256(salt, ikm) */
async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  return hmacSha256(salt, ikm);
}

/** HKDF-Expand de um único bloco (suficiente para as chaves de 16/12/32 bytes usadas aqui). */
async function hkdfExpandOneBlock(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const t = await hmacSha256(prk, concatBytes(info, new Uint8Array([1])));
  return t.slice(0, length);
}

// ---------------------------------------------------------------------------
// Chaves VAPID
// ---------------------------------------------------------------------------

async function generateVapidKeys(): Promise<VapidStored> {
  const keyPair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ]);
  const rawPublic = new Uint8Array(await crypto.subtle.exportKey("raw", keyPair.publicKey));
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  return { publicKey: base64UrlEncode(rawPublic), privateKeyJwk };
}

let vapidCache: VapidStored | null = null;

export async function getVapidKeys(): Promise<VapidStored> {
  if (vapidCache) return vapidCache;
  const stored = await getSetting<VapidStored | null>("webpush_vapid", null);
  if (stored?.publicKey && stored.privateKeyJwk) {
    vapidCache = stored;
    return stored;
  }
  const fresh = await generateVapidKeys();
  await setSetting("webpush_vapid", fresh);
  vapidCache = fresh;
  return fresh;
}

/** Chave pública VAPID em base64url, para `pushManager.subscribe({ applicationServerKey })` no navegador. */
export async function getVapidPublicKey(): Promise<string> {
  return (await getVapidKeys()).publicKey;
}

async function importVapidPrivateKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
}

/** JWT VAPID (RFC 8292), assinado ES256. `crypto.subtle` já produz a assinatura no formato raw r||s (64 bytes) que o JWS exige — sem conversão de DER. */
async function buildVapidJwt(audience: string): Promise<{ jwt: string; publicKey: string }> {
  const { publicKey, privateKeyJwk } = await getVapidKeys();
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: VAPID_SUBJECT,
  };
  const encodedHeader = base64UrlEncode(utf8(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(utf8(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const privateKey = await importVapidPrivateKey(privateKeyJwk);
  const signature = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, utf8(signingInput) as BufferSource),
  );

  return { jwt: `${signingInput}.${base64UrlEncode(signature)}`, publicKey };
}

// ---------------------------------------------------------------------------
// Criptografia do payload (RFC 8291 + RFC 8188, esquema "aes128gcm")
// ---------------------------------------------------------------------------

export type PushSubscriptionKeys = {
  endpoint: string;
  p256dh: string; // base64url, 65 bytes (ponto EC não comprimido do navegador)
  auth: string; // base64url, 16 bytes
};

async function encryptPayload(
  subscription: PushSubscriptionKeys,
  plaintext: Uint8Array,
): Promise<Uint8Array> {
  const uaPublicBytes = base64UrlDecode(subscription.p256dh);
  const authSecret = base64UrlDecode(subscription.auth);

  // Chave EC efêmera do servidor (as = "app server")
  const asKeyPair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits",
  ]);
  const asPublicBytes = new Uint8Array(await crypto.subtle.exportKey("raw", asKeyPair.publicKey));

  const uaPublicKey = await crypto.subtle.importKey(
    "raw",
    uaPublicBytes as BufferSource,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  const ecdhSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: uaPublicKey }, asKeyPair.privateKey, 256),
  );

  // RFC 8291 §3.4: deriva o IKM que alimenta o HKDF de aes128gcm (RFC 8188).
  const prkKey = await hkdfExtract(authSecret, ecdhSecret);
  const keyInfo = concatBytes(utf8("WebPush: info\0"), uaPublicBytes, asPublicBytes);
  const ikm = await hkdfExpandOneBlock(prkKey, keyInfo, 32);

  // RFC 8188 §2.1: salt aleatório de 16 bytes, PRK = HKDF-Extract(salt, IKM).
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hkdfExtract(salt, ikm);

  const cek = await hkdfExpandOneBlock(prk, utf8("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdfExpandOneBlock(prk, utf8("Content-Encoding: nonce\0"), 12);

  // Delimitador de registro único (0x02, "último registro") — sem padding extra.
  const padded = concatBytes(plaintext, new Uint8Array([2]));

  const aesKey = await crypto.subtle.importKey("raw", cek as BufferSource, { name: "AES-GCM" }, false, [
    "encrypt",
  ]);
  const ciphertextWithTag = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce as BufferSource }, aesKey, padded as BufferSource),
  );

  // Cabeçalho aes128gcm: salt(16) || rs(4, big-endian) || idlen(1) || keyid(as_public, 65)
  const rsBytes = new Uint8Array(4);
  new DataView(rsBytes.buffer).setUint32(0, RECORD_SIZE, false);
  const header = concatBytes(salt, rsBytes, new Uint8Array([asPublicBytes.length]), asPublicBytes);

  return concatBytes(header, ciphertextWithTag);
}

// ---------------------------------------------------------------------------
// Envio
// ---------------------------------------------------------------------------

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

type SendResult = { ok: true } | { ok: false; status?: number; erro: string; expirada: boolean };

async function sendOne(subscription: PushSubscriptionKeys, payload: PushPayload): Promise<SendResult> {
  try {
    const encrypted = await encryptPayload(subscription, utf8(JSON.stringify(payload)));
    const audience = new URL(subscription.endpoint).origin;
    const { jwt, publicKey } = await buildVapidJwt(audience);

    const res = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        TTL: "86400",
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        Urgency: "high",
        Authorization: `vapid t=${jwt}, k=${publicKey}`,
      },
      body: encrypted as BodyInit,
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) return { ok: true };

    const expirada = res.status === 404 || res.status === 410;
    return { ok: false, status: res.status, erro: `HTTP ${res.status}`, expirada };
  } catch (err) {
    return { ok: false, erro: err instanceof Error ? err.message : String(err), expirada: false };
  }
}

async function registrarStatusPush(resumo: Record<string, unknown>) {
  try {
    await setSetting("push_status", { ...resumo, em: new Date().toISOString() });
  } catch (err) {
    console.error("registrarStatusPush falhou:", err);
  }
}

/**
 * Envia a notificação para todos os aparelhos inscritos. Inscrições que o
 * provedor recusa como mortas (404/410) são apagadas; outros erros só ficam
 * registrados em `ultimo_erro` (a inscrição continua tentando nas próximas).
 */
export async function sendPushToAll(payload: PushPayload): Promise<{ enviados: number; falhas: number }> {
  // DISABLE_PUSH=1: usado em testes locais (ex.: agendamento de visita via
  // Playwright) para não tocar de verdade no celular do dono. Mantém a
  // checagem no código para futuros testes — nunca ligado em produção.
  if (process.env.DISABLE_PUSH === "1") {
    console.warn("sendPushToAll: DISABLE_PUSH=1, envio pulado");
    return { enviados: 0, falhas: 0 };
  }

  const rows = (await sql`
    select id, endpoint, p256dh, auth from push_subscriptions
  `) as { id: string; endpoint: string; p256dh: string; auth: string }[];

  let enviados = 0;
  let falhas = 0;

  await Promise.all(
    rows.map(async (row) => {
      const result = await sendOne({ endpoint: row.endpoint, p256dh: row.p256dh, auth: row.auth }, payload);
      if (result.ok) {
        enviados++;
        await sql`update push_subscriptions set ultimo_ok_em = now(), ultimo_erro = null where id = ${row.id}`;
        return;
      }

      falhas++;
      if (result.expirada) {
        await sql`delete from push_subscriptions where id = ${row.id}`;
      } else {
        await sql`update push_subscriptions set ultimo_erro = ${result.erro} where id = ${row.id}`;
      }
    }),
  );

  await registrarStatusPush({ enviados, falhas });
  return { enviados, falhas };
}

/** Existe ao menos um aparelho inscrito para push? Usado pelo cron sem-resposta e pelo aviso no dashboard. */
export async function hasAnyPushSubscription(): Promise<boolean> {
  const rows = (await sql`select exists(select 1 from push_subscriptions) as exists`) as { exists: boolean }[];
  return Boolean(rows[0]?.exists);
}
