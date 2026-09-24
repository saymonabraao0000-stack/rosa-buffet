"use client";

import { useState, useTransition } from "react";
import { MessageSquareQuote, Copy, Check } from "lucide-react";
import { requestTestimonialAction } from "@/lib/crm/testimonial-actions";
import { toWhatsappNumber } from "@/lib/crm/whatsapp";

type PedirDepoimentoButtonProps = {
  leadId: string;
  nome: string;
  telefone: string;
};

// Botão "Pedir depoimento" para a ficha de leads fechados: gera o link
// público (/depoimento/[token]) e oferece copiar ou já sair pelo WhatsApp
// com uma mensagem curta pronta. Não expõe telefone nem dado do lead em
// lugar nenhum público — só usa esses dados aqui, no CRM autenticado.
export default function PedirDepoimentoButton({ leadId, nome, telefone }: PedirDepoimentoButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await requestTestimonialAction(leadId);
      if (result.ok) {
        setLink(result.link);
        setCopied(false);
      } else {
        setError(result.error);
      }
    });
  };

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Não foi possível copiar. Copie manualmente.");
    }
  };

  const primeiroNome = nome.trim().split(/\s+/)[0] || "";
  const whatsappText = `Oi, ${primeiroNome}! Foi um prazer produzir sua festa 💛 Se puder, deixa um depoimento rapidinho pra gente aqui: ${link ?? ""}`;
  const whatsappUrl = link
    ? `https://wa.me/${toWhatsappNumber(telefone)}?text=${encodeURIComponent(whatsappText)}`
    : undefined;

  if (!link) {
    return (
      <div>
        <button
          type="button"
          disabled={isPending}
          onClick={handleClick}
          className="focus-gold flex items-center gap-2 rounded-full bg-cream/10 px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-cream/15 disabled:opacity-60"
        >
          <MessageSquareQuote className="h-4 w-4" aria-hidden="true" />
          {isPending ? "Gerando link..." : "Pedir depoimento"}
        </button>
        {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-cream/15 bg-ink px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-cream/60">Link do depoimento</p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="focus-gold min-w-0 flex-1 truncate rounded-lg border border-cream/15 bg-ink-soft px-3 py-2 text-xs text-cream outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="focus-gold flex shrink-0 items-center gap-1.5 rounded-full bg-cream/10 px-3 py-2 text-xs font-semibold text-cream transition-colors hover:bg-cream/15"
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-gold self-start text-xs font-semibold text-gold underline underline-offset-2 hover:text-gold-soft"
      >
        Enviar pelo WhatsApp
      </a>
    </div>
  );
}
