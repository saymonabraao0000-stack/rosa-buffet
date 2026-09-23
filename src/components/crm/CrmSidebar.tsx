"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, Plus, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/crm/actions";

const navItems = [
  { href: "/crm", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm/leads", label: "Leads", icon: Users },
  { href: "/crm/agenda", label: "Agenda", icon: Calendar },
];

// No computador (lg+): menu lateral. No celular: barra no topo (logo, novo
// lead, sair) + abas fixas embaixo, ao alcance do polegar.
export default function CrmSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/crm" ? pathname === "/crm" : pathname.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-cream/10 bg-ink/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/crm" className="focus-gold block rounded-full">
          <Image src="/images/logo-header.png" alt="Rosa Buffet" width={900} height={235} priority className="h-6 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/crm/leads/novo"
            className="focus-gold flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-2 text-xs font-semibold text-ink"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo lead
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sair"
              className="focus-gold flex h-9 w-9 items-center justify-center rounded-full text-cream/60 hover:text-cream"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </header>

      <nav
        aria-label="Navegação do CRM"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-cream/10 bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-gold flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                isActive(item.href) ? "text-gold" : "text-cream/60"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-cream/10 bg-ink px-4 py-6 lg:flex">
        <Link href="/crm" className="focus-gold mb-8 block rounded-full px-2">
          <Image
            src="/images/logo-header.png"
            alt="Rosa Buffet"
            width={900}
            height={235}
            priority
            className="h-7 w-auto"
          />
        </Link>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Navegação do CRM">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`focus-gold flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-gold/15 text-gold" : "text-cream/70 hover:bg-cream/5 hover:text-cream"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/crm/leads/novo"
          className="focus-gold mt-4 flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo lead
        </Link>

        <form action={logoutAction} className="mt-6 border-t border-cream/10 pt-4">
          <button
            type="submit"
            className="focus-gold flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-cream/60 transition-colors hover:text-cream"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sair
          </button>
        </form>
      </aside>
    </>
  );
}
