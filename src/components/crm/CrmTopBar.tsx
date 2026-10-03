"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, LogOut, Plus } from "lucide-react";
import { logoutAction } from "@/lib/crm/actions";

// Barra única do CRM (celular e computador). As áreas ficam na tela de
// entrada (/crm), em grade de aplicativos; dentro de cada área, "Início" volta.
export default function CrmTopBar() {
  const pathname = usePathname();
  const naEntrada = pathname === "/crm";

  return (
    <header className="sticky top-0 z-30 border-b border-cream/10 bg-ink/95 px-4 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 py-2.5 sm:py-3">
        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          {!naEntrada && (
            <Link
              href="/crm"
              className="focus-gold flex items-center rounded-lg py-1.5 pr-2 text-[15px] font-medium text-gold transition-colors hover:text-gold-soft"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              Início
            </Link>
          )}
          <Link href="/crm" className={`focus-gold block shrink-0 rounded-full ${naEntrada ? "px-1" : ""}`}>
            <Image
              src="/images/logo-header.png"
              alt="Rosa Buffet"
              width={900}
              height={235}
              priority
              className="h-6 w-auto sm:h-7"
            />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/crm/leads/novo"
            className="focus-gold flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-gold-soft sm:text-sm"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo lead
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sair"
              className="focus-gold flex h-9 w-9 items-center justify-center rounded-full text-cream/60 transition-colors hover:text-cream"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
