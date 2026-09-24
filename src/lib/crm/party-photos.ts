import "server-only";
import { sql } from "@/lib/db/client";
import { portfolioCategories } from "@/lib/portfolio-data";

const TEMA_SLUGS = new Set(portfolioCategories.map((c) => c.slug));
const ALLOWED_MIME = new Set(["image/webp", "image/jpeg", "image/png"]);
const MAX_BYTES = 900 * 1024;
const MIN_DIMENSION = 50;
const MAX_DIMENSION = 5000;

export type PartyPhotoMeta = {
  id: string;
  tema: string;
  mime: string;
  width: number;
  height: number;
  legenda: string | null;
  visivel: boolean;
  createdAt: string;
};

export function isValidTemaSlug(tema: string): boolean {
  return TEMA_SLUGS.has(tema);
}

function validate(input: { tema: string; mime: string; bytesLength: number; width: number; height: number }): string | null {
  if (!isValidTemaSlug(input.tema)) return "Tema inválido.";
  if (!ALLOWED_MIME.has(input.mime)) return "Formato de imagem não suportado (use WebP, JPEG ou PNG).";
  if (input.bytesLength > MAX_BYTES) return "Arquivo maior que 900 KB.";
  if (input.bytesLength <= 0) return "Arquivo vazio.";
  if (
    !Number.isFinite(input.width) ||
    !Number.isFinite(input.height) ||
    input.width < MIN_DIMENSION ||
    input.height < MIN_DIMENSION ||
    input.width > MAX_DIMENSION ||
    input.height > MAX_DIMENSION
  ) {
    return "Dimensões da imagem fora do intervalo permitido.";
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMetaRow(row: any): PartyPhotoMeta {
  return {
    id: row.id,
    tema: row.tema,
    mime: row.mime,
    width: row.width,
    height: row.height,
    legenda: row.legenda,
    visivel: row.visivel,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export async function insertPartyPhoto(input: {
  tema: string;
  bytes: Uint8Array;
  mime: string;
  width: number;
  height: number;
  legenda?: string | null;
}): Promise<{ id: string } | { error: string }> {
  const error = validate({ tema: input.tema, mime: input.mime, bytesLength: input.bytes.length, width: input.width, height: input.height });
  if (error) return { error };

  const rows = await sql`
    insert into party_photos (tema, data, mime, width, height, legenda)
    values (${input.tema}, ${Buffer.from(input.bytes)}, ${input.mime}, ${input.width}, ${input.height}, ${input.legenda ?? null})
    returning id
  `;
  return { id: rows[0].id as string };
}

/** Lista para o CRM (sem bytes), todas as fotos, mais novas primeiro. */
export async function listPartyPhotosForCrm(): Promise<PartyPhotoMeta[]> {
  const rows = await sql`
    select id, tema, mime, width, height, legenda, visivel, created_at
    from party_photos
    order by created_at desc
  `;
  return rows.map(mapMetaRow);
}

/** Lista as fotos visíveis para o site, por tema (opcional), mais novas primeiro. */
export async function listVisiblePartyPhotos(tema?: string): Promise<Pick<PartyPhotoMeta, "id" | "tema" | "width" | "height">[]> {
  const rows = tema
    ? await sql`
        select id, tema, width, height
        from party_photos
        where visivel = true and tema = ${tema}
        order by created_at desc
      `
    : await sql`
        select id, tema, width, height
        from party_photos
        where visivel = true
        order by created_at desc
      `;
  return rows.map((r) => ({ id: r.id as string, tema: r.tema as string, width: r.width as number, height: r.height as number }));
}

export async function getPartyPhotoBytes(id: string): Promise<{ data: Buffer; mime: string; visivel: boolean } | null> {
  const rows = await sql`
    select data, mime, visivel from party_photos where id = ${id}
  `;
  if (rows.length === 0) return null;
  const row = rows[0];
  return { data: row.data as Buffer, mime: row.mime as string, visivel: row.visivel as boolean };
}

export async function togglePartyPhotoVisible(id: string, visivel: boolean): Promise<void> {
  await sql`update party_photos set visivel = ${visivel} where id = ${id}`;
}

export async function updatePartyPhotoTema(id: string, tema: string): Promise<{ ok: true } | { error: string }> {
  if (!isValidTemaSlug(tema)) return { error: "Tema inválido." };
  await sql`update party_photos set tema = ${tema} where id = ${id}`;
  return { ok: true };
}

export async function deletePartyPhoto(id: string): Promise<void> {
  await sql`delete from party_photos where id = ${id}`;
}
