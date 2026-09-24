import { NextResponse } from "next/server";
import { listVisiblePartyPhotos } from "@/lib/crm/party-photos";

// Consumida pelo /celebracoes (client component) via fetch no cliente — a
// página é estática, então as fotos novas do banco entram por cima do que já
// existe, sem precisar rebuild. Só o essencial para montar o grid.
export async function GET() {
  const fotos = await listVisiblePartyPhotos();

  return NextResponse.json(
    { fotos },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    },
  );
}
