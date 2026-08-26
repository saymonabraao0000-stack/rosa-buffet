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

export default function CrmSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-cream/10 bg-ink px-4 py-6">
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
          const active = item.href === "/crm" ? pathname === "/crm" : pathname.startsWith(item.href);
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
  );
}
