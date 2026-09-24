import type { Metadata, Viewport } from "next";
import Image from "next/image";
import LoginForm from "@/components/crm/LoginForm";

// Item 7 — mesmo manifest do CRM aqui: é a primeira tela ao abrir o app
// instalado (antes de logar), então também precisa do escopo e do tema.
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

export default function CrmLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-ink-soft px-6">
      <Image
        src="/images/logo-header.png"
        alt="Rosa Buffet"
        width={900}
        height={235}
        priority
        className="h-10 w-auto"
      />
      <LoginForm />
    </div>
  );
}
