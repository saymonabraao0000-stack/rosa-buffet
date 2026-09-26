import { requireSession } from "@/lib/crm/require-session";
import { listPartyPhotosForCrm } from "@/lib/crm/party-photos";
import PartyPhotosUploader from "@/components/crm/PartyPhotosUploader";

export const dynamic = "force-dynamic";

export default async function CrmFotosPage() {
  await requireSession();

  const photos = await listPartyPhotosForCrm();

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Fotos das festas</h1>
      <p className="mt-2 text-sm text-cream/60">
        Envie fotos de festas realizadas: elas aparecem no topo do portfólio (/celebracoes), no tema escolhido,
        junto das fotos já existentes.
      </p>

      <div className="mt-6">
        <PartyPhotosUploader photos={photos} />
      </div>
    </div>
  );
}
