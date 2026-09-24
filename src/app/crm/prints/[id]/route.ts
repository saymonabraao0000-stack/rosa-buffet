import { NextResponse } from "next/server";
import { requireSession } from "@/lib/crm/require-session";
import { getReviewPrintBytes } from "@/lib/crm/review-prints";

// Versão protegida por sessão, usada só pela grade de miniaturas em
// /crm/depoimentos: ao contrário de /api/prints/[id] (pública), serve o
// print mesmo quando está oculto — a equipe precisa ver a miniatura de algo
// que tirou do site para decidir se reativa ou exclui de vez.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();

  const { id } = await params;
  const print = await getReviewPrintBytes(id);
  if (!print) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(print.data), {
    headers: {
      "Content-Type": print.mime,
      "Cache-Control": "private, max-age=60",
    },
  });
}
