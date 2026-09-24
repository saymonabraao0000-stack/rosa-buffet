import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import GoogleRating from "@/components/ui/GoogleRating";
import Testimonials from "@/components/sections/Testimonials";
import { siteConfig } from "@/lib/site-config";

const title = "Depoimentos de Clientes";
const description =
  "O que dizem as famílias que fizeram a festa com a Rosa Buffet em Manaus: conversas e avaliações reais de clientes.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/depoimentos" },
  openGraph: {
    title: `Depoimentos | ${siteConfig.name}`,
    description,
    images: [{ url: "/images/eventos/hero-salao.jpg", width: 1672, height: 941 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Depoimentos | ${siteConfig.name}`,
    description,
    images: ["/images/eventos/hero-salao.jpg"],
  },
};

export default function DepoimentosPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHeader
          title="Depoimentos"
          description="Conversas e avaliações reais de quem já comemorou com a gente."
        >
          <GoogleRating className="mt-2" />
        </PageHeader>
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
