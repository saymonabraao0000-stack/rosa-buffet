import { Star } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const nota = siteConfig.googleReviews.rating.toLocaleString("pt-BR", { minimumFractionDigits: 1 });

/**
 * Selo "★ 4,6 no Google · 266 avaliações", com link para as avaliações.
 * Os números ficam em siteConfig.googleReviews e são atualizados à mão.
 * `tone="dark"` para fundo escuro (home, páginas institucionais), `"light"` para fundo claro (simulador).
 */
export default function GoogleRating({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const { rating, count, url } = siteConfig.googleReviews;
  const fill = `${(rating / 5) * 100}%`;
  const text = tone === "dark" ? "text-cream/85 hover:text-cream" : "text-ink/80 hover:text-ink";
  const border = tone === "dark" ? "border-cream/15 bg-ink/40 hover:border-gold/60" : "border-ink/10 bg-white hover:border-gold";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Nota ${nota} de 5 no Google, com ${count} avaliações. Ver avaliações`}
      className={`focus-gold inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm backdrop-blur-sm transition-colors ${border} ${text} ${className}`}
    >
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex text-gold/30">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
        </span>
        <span className="absolute inset-0 flex overflow-hidden text-gold" style={{ width: fill }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="h-4 w-4 shrink-0 fill-current" />
          ))}
        </span>
      </span>
      <span>
        <strong className="font-semibold">{nota}</strong> no Google · {count} avaliações
      </span>
    </a>
  );
}
