import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisitaForm from "@/components/visita/VisitaForm";
import { getFreeSlotsForRange } from "@/lib/visitas";
import { manausTodayISO } from "@/lib/crm/manaus-date";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agende uma visita ao salão",
  description:
    "Escolha um dia e horário para conhecer o salão da Rosa Buffet pessoalmente, com nossa equipe.",
  alternates: {
    canonical: "/visita",
  },
  openGraph: {
    title: "Agende uma visita ao salão | Rosa Buffet",
    description: "Escolha um dia e horário para conhecer o salão pessoalmente.",
    images: [{ url: "/images/eventos/hero-salao.jpg", width: 1672, height: 941 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agende uma visita ao salão | Rosa Buffet",
    description: "Escolha um dia e horário para conhecer o salão pessoalmente.",
    images: ["/images/eventos/hero-salao.jpg"],
  },
};

export default async function VisitaPage({
  searchParams,
}: {
  searchParams: Promise<{ nome?: string; tel?: string; origem?: string }>;
}) {
  const [dias, params] = await Promise.all([getFreeSlotsForRange(), searchParams]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink pt-28 pb-20 text-cream">
        <VisitaForm
          hoje={manausTodayISO()}
          dias={dias}
          nomeInicial={params.nome ?? ""}
          telefoneInicial={params.tel ?? ""}
          origem={params.origem}
        />
      </main>
      <Footer />
    </>
  );
}
