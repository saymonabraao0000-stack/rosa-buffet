import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import About from "@/components/sections/About";
import Differentiators from "@/components/sections/Differentiators";
import Gallery from "@/components/sections/Gallery";
import { siteConfig } from "@/lib/site-config";

const title = "Sobre nós";
const description =
  "Conheça a Rosa Buffet: buffet e produção de eventos em Manaus, com salão próprio, equipe especializada e atendimento do planejamento ao fim da festa.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sobre" },
  openGraph: {
    title: `Sobre nós | ${siteConfig.name}`,
    description,
    images: [{ url: "/images/eventos/hero-salao.jpg", width: 1672, height: 941 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Sobre nós | ${siteConfig.name}`,
    description,
    images: ["/images/eventos/hero-salao.jpg"],
  },
};

export default function SobrePage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title="Sobre a Rosa Buffet"
          description="Buffet, decoração e produção de eventos em Manaus, com salão próprio e uma equipe que acompanha a sua festa do planejamento ao último convidado."
        />
        <About />
        <Differentiators />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}
