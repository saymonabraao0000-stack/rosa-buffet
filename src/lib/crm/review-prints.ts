import "server-only";
import { sql } from "@/lib/db/client";

// Prints de avaliações enviados pela equipe pelo CRM (/crm/depoimentos),
// guardados como bytea no Postgres — sem storage de arquivos no projeto, e
// o volume é pequeno porque cada imagem já chega redimensionada e comprimida
// (ver validação abaixo). Servidos publicamente por /api/prints/[id].

export const ALLOWED_MIME_TYPES = ["image/webp", "image/jpeg", "image/png"] as const;
export type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_BYTES = 600 * 1024; // 600 KB
export const MIN_DIMENSION = 50;
export const MAX_DIMENSION = 4000;

export type ReviewPrintMeta = {
  id: string;
  width: number;
  height: number;
  legenda: string | null;
  visivel: boolean;
  createdAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMetaRow(row: any): ReviewPrintMeta {
  return {
    id: row.id,
    width: row.width,
    height: row.height,
    legenda: row.legenda,
    visivel: row.visivel,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export type ValidationError =
  | "mime_invalido"
  | "arquivo_grande"
  | "dimensao_invalida";

/** Valida bytes/mime/dimensões antes de gravar. Nunca confia no que veio do navegador sem checar de novo aqui. */
export function validateReviewPrint(input: {
  bytes: Uint8Array;
  mime: string;
  width: number;
  height: number;
}): ValidationError | null {
  if (!ALLOWED_MIME_TYPES.includes(input.mime as AllowedMime)) return "mime_invalido";
  if (input.bytes.byteLength === 0 || input.bytes.byteLength > MAX_BYTES) return "arquivo_grande";
  if (
    !Number.isInteger(input.width) ||
    !Number.isInteger(input.height) ||
    input.width < MIN_DIMENSION ||
    input.width > MAX_DIMENSION ||
    input.height < MIN_DIMENSION ||
    input.height > MAX_DIMENSION
  ) {
    return "dimensao_invalida";
  }
  return null;
}

export async function insertReviewPrint(input: {
  bytes: Uint8Array;
  mime: string;
  width: number;
  height: number;
  legenda?: string | null;
}): Promise<{ id: string } | { error: ValidationError }> {
  const error = validateReviewPrint(input);
  if (error) return { error };

  const rows = await sql`
    insert into review_prints (data, mime, width, height, legenda)
    values (${Buffer.from(input.bytes)}, ${input.mime}, ${input.width}, ${input.height}, ${input.legenda ?? null})
    returning id
  `;
  return { id: rows[0].id };
}

/** Lista para o CRM (todos, visíveis e ocultos) — nunca inclui os bytes. */
export async function listReviewPrintsForCrm(): Promise<ReviewPrintMeta[]> {
  const rows = await sql`
    select id, width, height, legenda, visivel, created_at
    from review_prints
    order by created_at desc
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map(mapMetaRow);
}

/** Lista pública para o site — só os visíveis, mais novos primeiro, sem os bytes. */
export async function listVisibleReviewPrints(): Promise<ReviewPrintMeta[]> {
  const rows = await sql`
    select id, width, height, legenda, visivel, created_at
    from review_prints
    where visivel = true
    order by created_at desc
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map(mapMetaRow);
}

/** Busca os bytes + mime + visibilidade de um print, para a rota que serve a imagem. */
export async function getReviewPrintBytes(
  id: string,
): Promise<{ data: Buffer; mime: string; visivel: boolean } | null> {
  const rows = await sql`
    select data, mime, visivel from review_prints where id = ${id}
  `;
  if (!rows[0]) return null;
  return { data: rows[0].data as Buffer, mime: rows[0].mime, visivel: rows[0].visivel };
}

export async function toggleReviewPrintVisible(id: string, visivel: boolean): Promise<void> {
  await sql`update review_prints set visivel = ${visivel} where id = ${id}`;
}

export async function deleteReviewPrint(id: string): Promise<void> {
  await sql`delete from review_prints where id = ${id}`;
}
