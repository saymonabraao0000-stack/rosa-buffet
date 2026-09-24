import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisitaForm from "@/components/visita/VisitaForm";
import { getFreeSlotsForRange } from "@/lib/visitas";

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
