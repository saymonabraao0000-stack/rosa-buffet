import type { ReactNode } from "react";
import { requireSession } from "@/lib/crm/require-session";
import CrmSidebar from "@/components/crm/CrmSidebar";

export default async function CrmProtectedLayout({ children }: { children: ReactNode }) {
  await requireSession();

  return (
    <div className="flex min-h-screen bg-ink-soft text-cream">
      <CrmSidebar />
      <main className="flex-1 overflow-x-auto px-8 py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
