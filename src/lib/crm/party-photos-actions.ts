"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "./require-session";
import {
  deletePartyPhoto,
  insertPartyPhoto,
  listPartyPhotosForCrm,
  togglePartyPhotoVisible,
  updatePartyPhotoTema,
  type PartyPhotoMeta,
} from "./party-photos";

export type UploadPartyPhotoState = { error?: string; ok?: boolean };

export async function uploadPartyPhotoAction(formData: FormData): Promise<UploadPartyPhotoState> {
  await requireSession();

  const blob = formData.get("blob");
  const tema = String(formData.get("tema") ?? "");
  const width = Number(formData.get("width"));
  const height = Number(formData.get("height"));

  if (!(blob instanceof Blob)) {
    return { error: "Arquivo ausente." };
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  const mime = blob.type || "application/octet-stream";

  const result = await insertPartyPhoto({ tema, bytes, mime, width, height });
  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath("/crm/fotos");
  return { ok: true };
}

export async function listPartyPhotosAction(): Promise<PartyPhotoMeta[]> {
  await requireSession();
  return listPartyPhotosForCrm();
}

export async function togglePartyPhotoVisibleAction(id: string, visivel: boolean): Promise<void> {
  await requireSession();
  await togglePartyPhotoVisible(id, visivel);
  revalidatePath("/crm/fotos");
}

export async function updatePartyPhotoTemaAction(id: string, tema: string): Promise<{ error?: string }> {
  await requireSession();
  const result = await updatePartyPhotoTema(id, tema);
  revalidatePath("/crm/fotos");
  if ("error" in result) return { error: result.error };
  return {};
}

export async function deletePartyPhotoAction(id: string): Promise<void> {
  await requireSession();
  await deletePartyPhoto(id);
  revalidatePath("/crm/fotos");
}
