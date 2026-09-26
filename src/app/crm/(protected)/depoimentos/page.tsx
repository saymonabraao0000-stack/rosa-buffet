import { requireSession } from "@/lib/crm/require-session";
import { listTestimonialsByStatusWithLead } from "@/lib/crm/testimonials";
import { listReviewPrintsForCrm } from "@/lib/crm/review-prints";
import DepoimentosList from "@/components/crm/DepoimentosList";
import PrintsUploader from "@/components/crm/PrintsUploader";

export const dynamic = "force-dynamic";

export default async function CrmDepoimentosPage() {
  await requireSession();

  const [pendente, aprovado, recusado, prints] = await Promise.all([
    listTestimonialsByStatusWithLead("pendente"),
    listTestimonialsByStatusWithLead("aprovado"),
    listTestimonialsByStatusWithLead("recusado"),
    listReviewPrintsForCrm(),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Depoimentos</h1>
      <p className="mt-2 text-sm text-cream/60">
        Pedidos de depoimento enviados aos clientes e prints de avaliações, para aprovar antes de aparecer no
        site.
      </p>

      <div className="mt-8">
        <h2 className="font-display text-xl text-cream">Prints de avaliações</h2>
        <p className="mt-1 text-sm text-cream/60">
          Envie capturas de tela de avaliações (Instagram, WhatsApp, Google): elas entram no carrossel da
          home junto com os depoimentos escritos.
        </p>
        <div className="mt-4">
          <PrintsUploader prints={prints} />
        </div>
      </div>

      <div className="mt-10 border-t border-cream/10 pt-8">
        <h2 className="font-display text-xl text-cream">Depoimentos escritos</h2>
        <div className="mt-4">
          <DepoimentosList porStatus={{ pendente, aprovado, recusado }} />
        </div>
      </div>
    </div>
  );
}
