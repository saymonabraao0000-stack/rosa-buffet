import { NextResponse } from "next/server";
import { getReviewPrintBytes } from "@/lib/crm/review-prints";

// Serve os bytes de um print de avaliação. O id é imutável (não há
// substituição de conteúdo no mesmo id — exclusão + novo upload), então o
// cache pode ser bem agressivo. 404 se não existir ou estiver oculto, para
// que um id descartado não vaze conteúdo removido da vitrine.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const print = await getReviewPrintBytes(id);
  if (!print || !print.visivel) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(print.data), {
    headers: {
      "Content-Type": print.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
