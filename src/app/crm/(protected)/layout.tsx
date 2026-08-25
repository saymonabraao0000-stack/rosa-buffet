import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { requireSession } from "@/lib/crm/require-session";
import { logoutAction } from "@/lib/crm/actions";

const navItems = [
  { href: "/crm", label: "Dashboard" },
  { href: "/crm/leads", label: "Leads" },
  { href: "/crm/agenda", label: "Agenda" },
];

export default async function CrmProtectedLayout({ children }: { children: ReactNode }) {
  await requireSession();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink/10 bg-ink">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/crm" className="focus-gold rounded-full">
              <Image
                src="/images/logo-header.png"
                alt="Rosa Buffet"
                width={900}
                height={235}
                priority
                className="h-7 w-auto"
              />
            </Link>
            <nav className="flex items-center gap-6" aria-label="Navegação do CRM">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="focus-gold text-sm font-medium text-cream/85 transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/crm/leads/novo"
              className="focus-gold rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
            >
              + Novo lead
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="focus-gold text-sm font-medium text-cream/70 transition-colors hover:text-cream"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
