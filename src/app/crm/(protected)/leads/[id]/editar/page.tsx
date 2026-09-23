import { requireSession } from "@/lib/crm/require-session";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadById } from "@/lib/crm/leads";
import { updateLeadAction } from "@/lib/crm/actions";
import LeadFields from "@/components/crm/LeadFields";

export const dynamic = "force-dynamic";

export default async function CrmEditarLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl text-cream">Editar lead</h1>
      <p className="mt-2 text-sm text-cream/60">
        Status, sinal e anotações continuam na ficha do lead.
      </p>

      <form action={updateLeadAction.bind(null, lead.id)} className="mt-6 flex flex-col gap-4">
        <LeadFields lead={lead} />

        <div className="mt-2 flex items-center gap-4">
          <button
            type="submit"
            className="focus-gold rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
          >
            Salvar
          </button>
          <Link
            href={`/crm/leads/${lead.id}`}
            className="focus-gold text-sm text-cream/60 transition-colors hover:text-cream"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
