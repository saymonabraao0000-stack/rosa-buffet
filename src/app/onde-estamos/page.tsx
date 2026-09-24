import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import Location from "@/components/sections/Location";
import { siteConfig } from "@/lib/site-config";

const title = "Onde Estamos: Salão de Festas na Cidade de Deus, Manaus";
const description =
  "O salão da Rosa Buffet fica na Rua São João, 310, Cidade de Deus, Manaus-AM. Veja o mapa, como chegar e agende uma visita ao salão.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/onde-estamos" },
  openGraph: {
    title: `Onde estamos | ${siteConfig.name}`,
    description,
    images: [{ url: "/images/eventos/hero-salao.jpg", width: 1672, height: 941 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Onde estamos | ${siteConfig.name}`,
    description,
    images: ["/images/eventos/hero-salao.jpg"],
  },
};

export default function OndeEstamosPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title="Onde estamos"
          description="Nosso salão fica na Cidade de Deus, em Manaus. Venha conhecer o espaço pessoalmente, com hora marcada."
        />
        <Location standalone />
      </main>
      <Footer />
    </>
  );
}
