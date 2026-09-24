import { requireSession } from "@/lib/crm/require-session";
import { countPerdidosTotal, listFunilLeads } from "@/lib/crm/funil";
import FunilBoard from "@/components/crm/FunilBoard";

export const dynamic = "force-dynamic";

export default async function CrmFunilPage() {
  await requireSession();
  const [leads, perdidosTotal] = await Promise.all([listFunilLeads(), countPerdidosTotal()]);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Funil</h1>
      <p className="mt-1 text-sm text-cream/60">
        Arraste os cartões entre as colunas para mudar o status. No celular, use &ldquo;Mover para&hellip;&rdquo; em
        cada cartão.
      </p>
      <div className="mt-6">
        <FunilBoard leads={leads} perdidosTotal={perdidosTotal} />
      </div>
    </div>
  );
}
