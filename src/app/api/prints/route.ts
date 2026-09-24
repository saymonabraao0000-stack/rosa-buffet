import { NextResponse } from "next/server";
import { listVisibleReviewPrints } from "@/lib/crm/review-prints";

// Lista pública dos prints visíveis, mais novos primeiro — consumida pelo
// carrossel de depoimentos na home (site estático, busca no cliente).
// Nunca inclui os bytes, só metadados (id/dimensões) para o <img> usar em
// conjunto com GET /api/prints/[id].
export async function GET() {
  const prints = await listVisibleReviewPrints();

  return NextResponse.json(
    { prints: prints.map((p) => ({ id: p.id, width: p.width, height: p.height })) },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    },
  );
}
