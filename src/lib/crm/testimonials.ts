import "server-only";
import { randomBytes } from "node:crypto";
import { sql } from "@/lib/db/client";

// Tipos próprios deste módulo — não vão em ./types.ts de propósito (outro
// agente está mexendo nesse arquivo em paralelo).
export type TestimonialStatus = "pendente" | "aprovado" | "recusado";

export type Testimonial = {
  id: string;
  leadId: string | null;
  token: string;
  nome: string | null;
  texto: string | null;
  nota: number | null;
  status: TestimonialStatus;
  createdAt: string;
  respondidoEm: string | null;
};

/** Versão pública/reduzida usada no site — nunca expõe lead_id, token nem telefone. */
export type TestimonialPublic = {
  nome: string;
  nota: number;
  texto: string;
  createdAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Testimonial {
  return {
    id: row.id,
    leadId: row.lead_id,
    token: row.token,
    nome: row.nome,
    texto: row.texto,
    nota: row.nota,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    respondidoEm: row.respondido_em
      ? row.respondido_em instanceof Date
        ? row.respondido_em.toISOString()
        : String(row.respondido_em)
      : null,
  };
}

/** Token aleatório e seguro para o link público do depoimento (32 bytes → 43 chars base64url). */
function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Nome do lead, só para pré-preencher o pedido de depoimento. Consulta
 * direta em `leads` (somente leitura) em vez de importar leads.ts, porque
 * esse arquivo está sendo editado em paralelo por outro agente nesta rodada.
 */
export async function getLeadNomeForTestimonial(leadId: string): Promise<string | null> {
  const rows = await sql`select nome from leads where id = ${leadId}`;
  return rows[0]?.nome ?? null;
}

/**
 * Cria o pedido de depoimento para um lead (festa fechada): gera o token e
 * grava o nome pré-preenchido — o cliente ainda não respondeu nada.
 */
export async function createTestimonialRequest(input: {
  leadId: string;
  nome: string;
}): Promise<{ id: string; token: string }> {
  const token = generateToken();
  const rows = await sql`
    insert into testimonials (lead_id, token, nome)
    values (${input.leadId}, ${token}, ${input.nome})
    returning id, token
  `;
  return { id: rows[0].id, token: rows[0].token };
}

export async function getTestimonialByToken(token: string): Promise<Testimonial | null> {
  const rows = await sql`select * from testimonials where token = ${token}`;
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const rows = await sql`select * from testimonials where id = ${id}`;
  return rows[0] ? mapRow(rows[0]) : null;
}

/**
 * Grava a resposta do cliente (nome, nota, texto) por token. O status
 * continua 'pendente' — só a equipe aprova/recusa depois, no CRM.
 * Não sobrescreve um depoimento já respondido.
 */
export async function submitTestimonialResponse(
  token: string,
  input: { nome: string; nota: number; texto: string },
): Promise<{ ok: true } | { ok: false; error: "nao_encontrado" | "ja_respondido" }> {
  const existing = await getTestimonialByToken(token);
  if (!existing) return { ok: false, error: "nao_encontrado" };
  if (existing.respondidoEm) return { ok: false, error: "ja_respondido" };

  // O `where respondido_em is null` + `returning` fecha a corrida de dois
  // envios simultâneos: só o primeiro atualiza a linha, o segundo volta vazio.
  const updated = await sql`
    update testimonials
    set nome = ${input.nome}, nota = ${input.nota}, texto = ${input.texto}, respondido_em = now()
    where token = ${token} and respondido_em is null
    returning id
  `;
  if (updated.length === 0) return { ok: false, error: "ja_respondido" };
  return { ok: true };
}

export async function listTestimonialsByStatus(status: TestimonialStatus): Promise<Testimonial[]> {
  const rows = await sql`
    select * from testimonials where status = ${status} order by created_at desc
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map(mapRow);
}

/** Versão usada pela tela /crm/depoimentos, com o nome do lead vinculado para o link da ficha. */
export type TestimonialWithLead = Testimonial & { leadNome: string | null };

export async function listTestimonialsByStatusWithLead(
  status: TestimonialStatus,
): Promise<TestimonialWithLead[]> {
  const rows = await sql`
    select t.*, l.nome as lead_nome
    from testimonials t
    left join leads l on l.id = t.lead_id
    where t.status = ${status}
    order by t.created_at desc
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map((row) => ({ ...mapRow(row), leadNome: row.lead_nome ?? null }));
}

export async function setTestimonialStatus(id: string, status: TestimonialStatus): Promise<void> {
  await sql`update testimonials set status = ${status} where id = ${id}`;
}

export async function deleteTestimonial(id: string): Promise<void> {
  await sql`delete from testimonials where id = ${id}`;
}

/** Depoimentos aprovados, para exibir no site — só o primeiro nome, nota e texto. */
export async function listApprovedTestimonialsForSite(): Promise<TestimonialPublic[]> {
  const rows = await sql`
    select nome, nota, texto, created_at from testimonials
    where status = 'aprovado' and texto is not null and nota is not null
    order by created_at desc
    limit 30
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map((row) => ({
    nome: (row.nome as string)?.trim().split(/\s+/)[0] ?? "Cliente",
    nota: row.nota,
    texto: row.texto,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }));
}
