import { requireSession } from "@/lib/crm/require-session";
import { createManualLeadAction } from "@/lib/crm/actions";
import { guestOptions, partyPackages, quizThemes } from "@/lib/quiz-data";

export default async function CrmNovoLeadPage() {
  await requireSession();
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl text-cream">Novo lead</h1>
      <p className="mt-2 text-sm text-cream/60">
        Para clientes que chegaram por telefone, Instagram ou indicação — não passaram pelo simulador.
      </p>

      <form action={createManualLeadAction} className="mt-6 flex flex-col gap-4">
        <TextField label="Nome" name="nome" required />
        <TextField label="Telefone" name="telefone" required placeholder="(92) 99999-9999" />

        <SelectField label="Tema (opcional)" name="temaSlug">
          <option value="">—</option>
          {quizThemes.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.label}
            </option>
          ))}
        </SelectField>

        <SelectField label="Convidados (opcional)" name="guestRangeSlug">
          <option value="">—</option>
          {guestOptions.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </SelectField>

        <SelectField label="Pacote (opcional)" name="buffetTierSlug">
          <option value="">—</option>
          {partyPackages.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.label}
            </option>
          ))}
        </SelectField>

        <TextField label="Data desejada (opcional)" name="dataEvento" type="date" />

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

function TextField({
  label,
  name,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-cream">
      {label}
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm font-normal text-cream placeholder:text-cream/30 outline-none focus:border-gold [color-scheme:dark]"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-cream">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm font-normal text-cream outline-none focus:border-gold"
      >
        {children}
      </select>
    </label>
  );
}
