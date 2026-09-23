import { requireSession } from "@/lib/crm/require-session";
import { notFound } from "next/navigation";
import { getLeadById } from "@/lib/crm/leads";
import { listNotesForLead } from "@/lib/crm/notes";
import { getGuestLabel, getPartyPackageLabel, getThemeLabel } from "@/lib/quiz-data";
import StatusForm from "@/components/crm/StatusForm";
import SinalToggle from "@/components/crm/SinalToggle";
import NoteForm from "@/components/crm/NoteForm";
import DeleteLeadButton from "@/components/crm/DeleteLeadButton";
import { buildLeadWhatsappUrl } from "@/lib/crm/whatsapp";
import Link from "next/link";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFullFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function CrmLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const [lead, notes] = await Promise.all([getLeadById(id), listNotesForLead(id)]);

  if (!lead) notFound();

  const temaLabel = getThemeLabel(lead.temaSlug);
  const guestLabel = getGuestLabel(lead.guestRangeSlug);
  const pacoteLabel = getPartyPackageLabel(lead.buffetTierSlug);
  // Leads antigos podem ter opcionais avulsos (addonSlugs) de antes do
  // simulador virar pacotes fechados — não existe mais lista de labels
  // pra eles, então mostramos o slug cru mesmo.
  const addonSlugsAntigos = lead.addonSlugs ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">{lead.nome}</h1>
          <p className="mt-1 text-sm text-cream/60">
            {lead.telefone} · {lead.source === "quiz" ? "veio pelo simulador" : "cadastro manual"} ·
            criado em {dateTimeFullFormatter.format(new Date(lead.createdAt))}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/crm/leads/${lead.id}/editar`}
            className="focus-gold rounded-full border border-cream/20 px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
          >
            Editar
          </Link>
          <a
            href={buildLeadWhatsappUrl(lead)}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-gold rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
          >
            Abrir WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="rounded-xl border border-cream/10 bg-cream/5 p-5">
            <h2 className="mb-4 font-display text-lg text-cream">Respostas do simulador</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <Field label="Tema" value={temaLabel} />
              <Field label="Convidados" value={guestLabel} />
              <Field
                label="Data desejada"
                value={
                  lead.dataSkipped
                    ? "Ainda não decidida"
                    : lead.dataEvento
                      ? dateTimeFormatter.format(new Date(`${lead.dataEvento}T00:00:00`))
                      : "—"
                }
              />
              <Field label="Pacote" value={pacoteLabel} />
              {addonSlugsAntigos.length > 0 && (
                <div className="col-span-full">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-cream/60">
                    Opcionais (cadastro antigo)
                  </dt>
                  <dd className="mt-1 text-cream">{addonSlugsAntigos.join(", ")}</dd>
                </div>
              )}
              <Field
                label="Estimativa"
                value={
                  lead.estimateMin != null && lead.estimateMax != null
                    ? `${currency.format(lead.estimateMin)} – ${currency.format(lead.estimateMax)}`
                    : undefined
                }
              />
              <Field label="Chegou até a etapa" value={lead.currentStep ?? undefined} />
            </dl>
          </section>

          <section className="mt-6 rounded-xl border border-cream/10 bg-cream/5 p-5">
            <h2 className="mb-4 font-display text-lg text-cream">Anotações</h2>
            <NoteForm leadId={lead.id} />
            <ul className="mt-5 flex flex-col gap-4">
              {notes.map((note) => (
                <li key={note.id} className="border-t border-cream/10 pt-3 text-sm">
                  <p className="text-cream">{note.text}</p>
                  <p className="mt-1 text-xs text-cream/60">
                    {dateTimeFullFormatter.format(new Date(note.createdAt))}
                  </p>
                </li>
              ))}
              {notes.length === 0 && (
                <li className="text-sm text-cream/60">Nenhuma anotação ainda.</li>
              )}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-xl border border-cream/10 bg-cream/5 p-5">
            <StatusForm leadId={lead.id} currentStatus={lead.status} currentMotivo={lead.perdidoMotivo} />
          </section>
          <section className="rounded-xl border border-cream/10 bg-cream/5 p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-cream/60">
              Reserva
            </h2>
            <SinalToggle leadId={lead.id} sinalPago={lead.sinalPago} />
          </section>
          <div className="flex justify-end">
            <DeleteLeadButton leadId={lead.id} nome={lead.nome} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-cream/60">{label}</dt>
      <dd className="mt-1 text-cream">{value ?? "—"}</dd>
    </div>
  );
}
