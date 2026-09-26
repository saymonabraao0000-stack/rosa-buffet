import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import Services from "@/components/sections/Services";
import FAQ from "@/components/sections/FAQ";
import { siteConfig } from "@/lib/site-config";

const title = "Serviços de Buffet e Eventos em Manaus";
const description =
  "Festas infantis, 15 anos, casamentos, aniversários e formaturas em Manaus. Buffet, decoração e produção completa com a Rosa Buffet.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/servicos" },
  openGraph: {
    title: `Serviços | ${siteConfig.name}`,
    description,
    images: [{ url: "/images/eventos/hero-salao.jpg", width: 1672, height: 941 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Serviços | ${siteConfig.name}`,
    description,
    images: ["/images/eventos/hero-salao.jpg"],
  },
};

export default function ServicosPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title="Serviços"
          description="Festas infantis, 15 anos, casamentos, formaturas e aniversários, com buffet, decoração e produção no mesmo lugar."
        />
        <Services />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
