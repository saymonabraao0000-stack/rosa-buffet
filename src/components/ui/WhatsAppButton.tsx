"use client";

import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import WhatsAppChoice from "@/components/ui/WhatsAppChoice";

type WhatsAppButtonProps = {
  message?: string;
  label?: string;
  variant?: "primary" | "secondary" | "outline-light" | "outline-dark";
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
  "outline-dark":
    "bg-transparent text-ink border border-ink/15 hover:border-gold hover:text-gold",
};

const sizeStyles: Record<NonNullable<WhatsAppButtonProps["size"]>, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

// Ao clicar, abre a escolha entre falar com a Rosa ou com o Wellington (os
// dois atendem no WhatsApp) — ver WhatsAppChoice. A API (label, message,
// variant, size, className) continua a mesma para não quebrar quem já usa
// esse componente pelo site.
export default function WhatsAppButton({
  message,
  label = "Solicitar orçamento",
  variant = "primary",
  size = "md",
  className = "",
  showIcon = true,
}: WhatsAppButtonProps) {
  return (
    <WhatsAppChoice
      message={message}
      ariaLabel={label}
      className={`focus-gold inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {showIcon && <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />}
      {label}
    </WhatsAppChoice>
  );
}
