import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import TestimonialsMarquee from "./TestimonialsMarquee";
import WrittenTestimonials from "./WrittenTestimonials";

// Depoimentos reais (capturas de conversas de clientes + prints de
// avaliações enviados pelo CRM) em carrossel infinito, sempre rodando. A
// faixa em si (TestimonialsMarquee, client component) começa só com os
// estáticos — igual ao render do servidor de sempre, sem layout shift — e
// acrescenta os prints do banco assim que GET /api/prints responde.
export default function Testimonials() {
  return (
    <section id="depoimentos" className="overflow-hidden bg-ink py-24 sm:py-32">
      <Container>
        <SectionHeading title="Quem viveu, recomenda." light />
      </Container>

      <TestimonialsMarquee />

      <WrittenTestimonials />
    </section>
  );
}
