import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { testimonialQuotes } from "@/lib/testimonial-quotes";
import TestimonialsMarquee from "./TestimonialsMarquee";
import WrittenTestimonials from "./WrittenTestimonials";

// Depoimentos reais. No topo, 3 citações transcritas dos prints em letra
// grande (legíveis de relance); abaixo, a faixa com os prints de conversas
// de clientes + prints enviados pelo CRM em carrossel infinito, como prova
// visual. A faixa (TestimonialsMarquee, client component) começa só com os
// estáticos — igual ao render do servidor, sem layout shift — e acrescenta
// os prints do banco assim que GET /api/prints responde.
export default function Testimonials() {
  return (
    <section id="depoimentos" className="overflow-hidden bg-ink py-14 sm:py-16">
      <Container>
        <SectionHeading title="Quem viveu, recomenda." light />

        {/* Celular: carrossel horizontal com scroll-snap (sangra até a borda
            da tela); desktop: 3 colunas. */}
        <div className="-mx-6 mt-8 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 [scrollbar-width:none] sm:mt-10 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-10 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
          {testimonialQuotes.map((q) => (
            <figure
              key={q.nome}
              className="flex w-[82%] shrink-0 snap-start flex-col gap-4 border-l border-gold/40 pl-5 sm:w-[60%] lg:w-auto"
            >
              <blockquote className="font-display text-xl leading-snug text-cream sm:text-2xl lg:text-xl">
                &ldquo;{q.texto}&rdquo;
              </blockquote>
              <figcaption className="text-sm text-gold">{q.nome}</figcaption>
            </figure>
          ))}
        </div>
      </Container>

      <TestimonialsMarquee />

      <WrittenTestimonials />
    </section>
  );
}
