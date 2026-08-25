import { createManualLeadAction } from "@/lib/crm/actions";
import { buffetTiers, guestRanges, quizThemes } from "@/lib/quiz-data";

export default function CrmNovoLeadPage() {
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl text-ink">Novo lead</h1>
      <p className="mt-2 text-sm text-gray-dark">
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
          {guestRanges.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.label}
            </option>
          ))}
        </SelectField>

        <SelectField label="Cardápio (opcional)" name="buffetTierSlug">
          <option value="">—</option>
          {buffetTiers.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.label}
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
    <label className="flex flex-col gap-1 text-sm font-medium text-ink">
      {label}
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="focus-gold rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm font-normal text-ink outline-none focus:border-gold"
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
    <label className="flex flex-col gap-1 text-sm font-medium text-ink">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="focus-gold rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm font-normal text-ink outline-none focus:border-gold"
      >
        {children}
      </select>
    </label>
  );
}
