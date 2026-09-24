import { buildTemplateWhatsappUrl } from "@/lib/crm/whatsapp";
import type { Lead } from "@/lib/crm/types";
import type { ModelosWhatsapp } from "@/lib/crm/settings";

// Item 2 — "Mais mensagens": menu com os 6 modelos de WhatsApp configuráveis
// em Configurações. `<details>` nativo — sem estado/JS extra.
const TEMPLATE_LABELS: { key: keyof ModelosWhatsapp; label: string }[] = [
  { key: "primeiroContato", label: "Primeiro contato" },
  { key: "retomarSimulacao", label: "Retomar simulação" },
  { key: "cobrarOrcamento", label: "Cobrar resposta do orçamento" },
  { key: "reservaConfirmada", label: "Reserva confirmada" },
  { key: "lembreteSaldo", label: "Lembrete do saldo" },
  { key: "posFesta", label: "Pós-festa" },
];

export default function WhatsappTemplatesMenu({
  lead,
  modelos,
  linkAvaliacaoGoogle,
}: {
  lead: Lead;
  modelos: ModelosWhatsapp;
  linkAvaliacaoGoogle: string;
}) {
  return (
    <details className="group relative">
      <summary className="focus-gold list-none cursor-pointer rounded-full border border-cream/20 px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold [&::-webkit-details-marker]:hidden">
        Mais mensagens
      </summary>
      <ul className="absolute right-0 z-20 mt-2 w-64 max-w-[85vw] rounded-xl border border-cream/15 bg-ink p-2 shadow-lg">
        {TEMPLATE_LABELS.map(({ key, label }) => (
          <li key={key}>
            <a
              href={buildTemplateWhatsappUrl(lead, modelos[key], { linkAvaliacaoGoogle })}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-gold block rounded-lg px-3 py-2 text-sm text-cream transition-colors hover:bg-cream/10 hover:text-gold"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
