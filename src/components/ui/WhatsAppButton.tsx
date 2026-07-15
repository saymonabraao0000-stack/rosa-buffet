import { MessageCircle } from "lucide-react";
import { buildWhatsappUrl } from "@/lib/site-config";

type WhatsAppButtonProps = {
  message?: string;
  label?: string;
  variant?: "primary" | "secondary" | "outline-light";
  size?: "md" | "lg";
  className?: string;
  showIcon?: boolean;
};

const variantStyles: Record<NonNullable<WhatsAppButtonProps["variant"]>, string> = {
  primary:
    "bg-gold text-ink hover:bg-gold-soft shadow-[0_8px_30px_-10px_rgba(201,162,39,0.6)]",
  secondary:
    "bg-ink text-cream hover:bg-ink-soft border border-white/10",
  "outline-light":
    "bg-transparent text-cream border border-cream/40 hover:bg-cream/10",
};

const sizeStyles: Record<NonNullable<WhatsAppButtonProps["size"]>, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function WhatsAppButton({
  message,
  label = "Solicitar orçamento",
  variant = "primary",
  size = "md",
  className = "",
  showIcon = true,
}: WhatsAppButtonProps) {
  return (
    <a
      href={buildWhatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`focus-gold inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {showIcon && <MessageCircle className="h-4 w-4" aria-hidden="true" />}
      {label}
    </a>
  );
}
