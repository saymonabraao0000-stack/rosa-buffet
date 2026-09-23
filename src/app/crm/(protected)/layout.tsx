import type { ReactNode } from "react";
import { requireSession } from "@/lib/crm/require-session";
import CrmSidebar from "@/components/crm/CrmSidebar";

export default async function CrmProtectedLayout({ children }: { children: ReactNode }) {
  await requireSession();

  return (
    <div className="min-h-screen bg-ink-soft text-cream lg:flex">
      <CrmSidebar />
      {/* pb-24 no celular: espaço para a barra de abas fixa embaixo */}
      <main className="min-w-0 flex-1 px-4 pt-6 pb-24 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
