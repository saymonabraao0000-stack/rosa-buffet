import { NextResponse } from "next/server";
import { listApprovedTestimonialsForSite } from "@/lib/crm/testimonials";

// Consumida pelo site (home, seção Depoimentos) via fetch no cliente — a
// home é estática e o cache do OpenNext é só de leitura, então não dá pra
// depender de revalidatePath para atualizar a lista ali. Só primeiro nome +
// nota + texto: nunca telefone nem qualquer outro dado do lead.
export async function GET() {
  const depoimentos = await listApprovedTestimonialsForSite();

  return NextResponse.json(
    { depoimentos },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
