import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { requireSession } from "@/lib/crm/require-session";
import CrmTopBar from "@/components/crm/CrmTopBar";

// Item 7 — CRM como app (PWA), escopado só em /crm: o manifest não entra no
// layout raiz do site público, só aqui e na página de login do CRM.
export const metadata: Metadata = {
  manifest: "/crm.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Rosa CRM",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
};

export default async function CrmProtectedLayout({ children }: { children: ReactNode }) {
  await requireSession();

  return (
    <div className="min-h-screen bg-ink-soft text-cream">
      <CrmTopBar />
      <main className="px-4 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
