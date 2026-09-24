import { NextResponse } from "next/server";
import { getPartyPhotoBytes } from "@/lib/crm/party-photos";

// Serve os bytes de uma foto de festa enviada pelo CRM. Público, sem sessão
// (o /celebracoes carrega essas imagens em <img> comuns) — só fotos marcadas
// como visíveis são servidas, o resto responde 404.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const photo = await getPartyPhotoBytes(id);
  if (!photo || !photo.visivel) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
