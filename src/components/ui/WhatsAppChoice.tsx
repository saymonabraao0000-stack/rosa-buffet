"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { buildWhatsappUrl, whatsappAttendants } from "@/lib/site-config";

type WhatsAppChoiceProps = {
  message?: string;
  className: string;
  children: ReactNode;
  ariaLabel?: string;
  menuAlign?: "left" | "right" | "center";
  /** Classe do wrapper (`relative inline-block` por padrão). Use para
   * `w-full`/`flex-1` quando o gatilho precisa ocupar o espaço do pai
   * (ex: dentro de um `flex`). */
  containerClassName?: string;
};

type AnchorRect = { top: number; bottom: number; left: number; right: number; width: number };

/**
 * Botão que, ao ser clicado, abre um pequeno menu para escolher entre falar
 * com a Rosa ou com o Wellington no WhatsApp — os dois atendem clientes.
 *
 * O menu (e o backdrop no celular) são renderizados via portal direto em
 * `document.body`: se renderizássemos dentro da árvore normal, um ancestral
 * com `transform` (ex: `motion.div` do framer-motion no botão flutuante, ou
 * seções com `overflow-hidden` como Hero/CTA) vira o novo "viewport" de
 * `position: fixed`, fazendo o menu aparecer no meio da página ou cortado em
 * vez de preso na tela. Fecha com Esc ou clique fora. `className` é aplicado
 * no `<button>` que dispara o menu.
 */
export default function WhatsAppChoice({
  message,
  className,
  children,
  ariaLabel,
  menuAlign = "right",
  containerClassName = "relative inline-block",
}: WhatsAppChoiceProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Sem estado "mounted": o portal só é criado depois de um clique (`open`),
  // que só acontece no navegador — não há divergência de SSR/hidratação a
  // evitar aqui.
  const updateAnchor = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAnchor({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateAnchor();
  }, [open, updateAnchor]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const insideTrigger = containerRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideTrigger && !insideMenu) setOpen(false);
    }
    function onViewportChange() {
      updateAnchor();
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [open, updateAnchor]);

  const desktopStyle: React.CSSProperties = anchor
    ? {
        top: anchor.bottom + 8,
        ...(menuAlign === "left"
          ? { left: anchor.left }
          : menuAlign === "center"
            ? { left: anchor.left + anchor.width / 2, transform: "translateX(-50%)" }
            : { right: Math.max(16, window.innerWidth - anchor.right) }),
      }
    : {};

  const menu = open && (
    <>
      <div
        className="fixed inset-0 z-[60] bg-ink/60 sm:hidden"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      {/* Bottom sheet — celular */}
      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-label="Escolher atendente do WhatsApp"
        className="fixed inset-x-3 bottom-3 z-[70] rounded-2xl border border-ink/10 bg-cream p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:hidden"
      >
        <WhatsAppChoiceMenuContent message={message} onSelect={() => setOpen(false)} />
      </div>
      {/* Popover — desktop, ancorado ao botão via posição calculada */}
      <div
        role="menu"
        aria-label="Escolher atendente do WhatsApp"
        style={desktopStyle}
        className="fixed z-[70] hidden w-64 rounded-2xl border border-ink/10 bg-cream p-2 shadow-2xl sm:block"
      >
        <WhatsAppChoiceMenuContent message={message} onSelect={() => setOpen(false)} />
      </div>
    </>
  );

  return (
    <div ref={containerRef} className={containerClassName}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={ariaLabel}
        onClick={() => setOpen((value) => !value)}
        className={className}
      >
        {children}
      </button>

      {open ? createPortal(menu, document.body) : null}
    </div>
  );
}

function WhatsAppChoiceMenuContent({
  message,
  onSelect,
}: {
  message?: string;
  onSelect: () => void;
}) {
  return (
    <>
      <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
        Falar no WhatsApp
      </p>
      {whatsappAttendants.map((atendente) => (
        <a
          key={atendente.nome}
          role="menuitem"
          href={buildWhatsappUrl(message, atendente)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onSelect}
          className="focus-gold flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold/10 hover:text-gold sm:py-2.5"
        >
          <WhatsAppIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          Falar com {atendente.saudacao}
        </a>
      ))}
    </>
  );
}
