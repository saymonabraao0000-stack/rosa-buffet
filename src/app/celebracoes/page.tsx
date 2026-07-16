import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PortfolioHeader from "@/components/sections/PortfolioHeader";
import PortfolioGallery from "@/components/sections/PortfolioGallery";
import CTA from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Celebrações | Portfólio de Festas",
  description:
    "Conheça o portfólio de festas da Rosa Buffet em Manaus: 15 anos, casamentos, festas infantis, formaturas e aniversários realizados com excelência.",
  alternates: {
    canonical: "/celebracoes",
  },
  openGraph: {
    title: "Celebrações | Portfólio de Festas da Rosa Buffet",
    description:
      "Momentos reais de festas realizadas pela Rosa Buffet em Manaus. Explore por tema e inspire-se para o seu evento.",
  },
};

export default function CelebracoesPage() {
  return (
    <>
      <Navbar />
      <main>
        <PortfolioHeader />
        <PortfolioGallery />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
