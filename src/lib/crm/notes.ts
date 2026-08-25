import "server-only";
import { sql } from "@/lib/db/client";
import type { LeadNote } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNoteRow(row: any): LeadNote {
  return {
    id: row.id,
    leadId: row.lead_id,
    text: row.text,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export async function addNote(leadId: string, text: string): Promise<LeadNote> {
  const rows = await sql`
    insert into lead_notes (lead_id, text)
    values (${leadId}, ${text})
    returning *
  `;
  return mapNoteRow(rows[0]);
}

export async function listNotesForLead(leadId: string): Promise<LeadNote[]> {
  const rows = await sql`
    select * from lead_notes where lead_id = ${leadId} order by created_at desc
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map(mapNoteRow);
}
