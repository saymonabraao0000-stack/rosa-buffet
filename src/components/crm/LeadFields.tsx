import type { ReactNode } from "react";
import { guestOptions, partyPackages, quizThemes } from "@/lib/quiz-data";
import type { Lead } from "@/lib/crm/types";

// Campos do lead usados em /crm/leads/novo e /crm/leads/[id]/editar.
// Sem `lead`, os campos vêm vazios (cadastro novo).
export default function LeadFields({ lead }: { lead?: Lead }) {
  return (
    <>
      <TextField label="Nome" name="nome" required defaultValue={lead?.nome} />
      <TextField
        label="Telefone"
        name="telefone"
        required
        placeholder="(92) 99999-9999"
        defaultValue={lead?.telefone}
      />

      <SelectField label="Tema (opcional)" name="temaSlug" defaultValue={lead?.temaSlug ?? ""}>
        <option value="">—</option>
        {quizThemes.map((t) => (
          <option key={t.slug} value={t.slug}>
            {t.label}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Convidados (opcional)"
        name="guestRangeSlug"
        defaultValue={lead?.guestRangeSlug ?? ""}
      >
        <option value="">—</option>
        {guestOptions.map((g) => (
          <option key={g.slug} value={g.slug}>
            {g.label}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Pacote (opcional)"
        name="buffetTierSlug"
        defaultValue={lead?.buffetTierSlug ?? ""}
      >
        <option value="">—</option>
        {partyPackages.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.label}
          </option>
        ))}
      </SelectField>

      <TextField
        label="Data desejada (opcional)"
        name="dataEvento"
        type="date"
        defaultValue={lead?.dataEvento ?? undefined}
      />
    </>
  );
}

export function TextField({
  label,
  name,
  required,
  placeholder,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
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
        defaultValue={defaultValue}
        className="focus-gold rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm font-normal text-cream placeholder:text-cream/30 outline-none focus:border-gold [color-scheme:dark]"
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: ReactNode;
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
