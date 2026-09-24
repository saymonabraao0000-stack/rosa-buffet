import { requireSession } from "@/lib/crm/require-session";

export const dynamic = "force-dynamic";

export default async function CrmFunilPage() {
  await requireSession();

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Funil</h1>
      <p className="mt-4 text-sm text-cream/60">Em construção.</p>
    </div>
  );
}
