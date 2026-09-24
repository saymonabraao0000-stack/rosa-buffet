import { FileText } from "lucide-react";

/**
 * Abre o orçamento em PDF do lead (item 10) numa aba nova. Rota
 * `GET /crm/leads/[id]/orcamento` — não é um componente client, é só um link
 * com ícone, no mesmo estilo dos outros botões da ficha.
 */
export default function OrcamentoPdfButton({ leadId }: { leadId: string }) {
  return (
    <a
      href={`/crm/leads/${leadId}/orcamento`}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-gold inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-sm font-medium text-cream/80 transition-colors hover:border-gold hover:text-gold"
    >
      <FileText className="h-4 w-4" aria-hidden="true" />
      Orçamento em PDF
    </a>
  );
}
