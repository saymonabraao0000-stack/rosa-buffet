import { requireSession } from "@/lib/crm/require-session";
import { createManualLeadAction } from "@/lib/crm/actions";
import LeadFields, { SelectField } from "@/components/crm/LeadFields";

export default async function CrmNovoLeadPage() {
  await requireSession();
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl text-cream">Novo lead</h1>
      <p className="mt-2 text-sm text-cream/60">
        Para clientes que chegaram por telefone, Instagram ou indicação, que não passaram pelo simulador.
      </p>

      <form action={createManualLeadAction} className="mt-6 flex flex-col gap-4">
        <LeadFields />

        <SelectField label="Status inicial" name="status" defaultValue="novo">
          <option value="novo">Novo</option>
          <option value="contatado">Contatado</option>
          <option value="orcamento_enviado">Orçamento enviado</option>
          <option value="fechado">Fechado</option>
        </SelectField>

        <button
          type="submit"
          className="focus-gold mt-2 self-start rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
        >
          Criar lead
        </button>
      </form>
    </div>
  );
}
