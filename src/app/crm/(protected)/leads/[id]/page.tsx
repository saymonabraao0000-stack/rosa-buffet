import { notFound } from "next/navigation";
import { getLeadById } from "@/lib/crm/leads";
import { listNotesForLead } from "@/lib/crm/notes";
import { addons, buffetTiers, guestRanges, quizThemes } from "@/lib/quiz-data";
import StatusForm from "@/components/crm/StatusForm";
import SinalToggle from "@/components/crm/SinalToggle";
import NoteForm from "@/components/crm/NoteForm";

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
  const { id } = await params;
  const [lead, notes] = await Promise.all([getLeadById(id), listNotesForLead(id)]);

  if (!lead) notFound();

  const tema = quizThemes.find((t) => t.slug === lead.temaSlug);
  const guestRange = guestRanges.find((g) => g.slug === lead.guestRangeSlug);
  const buffetTier = buffetTiers.find((b) => b.slug === lead.buffetTierSlug);
  const chosenAddons = addons.filter((a) => lead.addonSlugs.includes(a.slug));

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
        <a
          href={`https://wa.me/55${lead.telefone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-gold rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
        >
          Abrir WhatsApp
        </a>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="rounded-xl border border-cream/10 bg-cream/5 p-5">
            <h2 className="mb-4 font-display text-lg text-cream">Respostas do simulador</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <Field label="Tema" value={tema?.label} />
              <Field label="Convidados" value={guestRange?.label} />
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
              <Field label="Cardápio" value={buffetTier?.label} />
              <div className="col-span-full">
                <dt className="text-xs font-semibold uppercase tracking-wide text-cream/60">Opcionais</dt>
                <dd className="mt-1 text-cream">
                  {chosenAddons.length ? chosenAddons.map((a) => a.label).join(", ") : "Nenhum"}
                </dd>
              </div>
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
