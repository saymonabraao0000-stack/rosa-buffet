import { requireSession } from "@/lib/crm/require-session";
import { listTestimonialsByStatusWithLead } from "@/lib/crm/testimonials";
import DepoimentosList from "@/components/crm/DepoimentosList";

export const dynamic = "force-dynamic";

export default async function CrmDepoimentosPage() {
  await requireSession();

  const [pendente, aprovado, recusado] = await Promise.all([
    listTestimonialsByStatusWithLead("pendente"),
    listTestimonialsByStatusWithLead("aprovado"),
    listTestimonialsByStatusWithLead("recusado"),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Depoimentos</h1>
      <p className="mt-2 text-sm text-cream/60">
        Pedidos de depoimento enviados aos clientes, para aprovar antes de aparecer no site.
      </p>

      <div className="mt-6">
        <DepoimentosList porStatus={{ pendente, aprovado, recusado }} />
      </div>
    </div>
  );
}
