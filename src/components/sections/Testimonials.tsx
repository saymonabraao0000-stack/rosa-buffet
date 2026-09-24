import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { testimonialScreenshots } from "@/lib/testimonials-data";
import WrittenTestimonials from "./WrittenTestimonials";

// Depoimentos reais (capturas de conversas de clientes) em carrossel
// infinito, sempre rodando. A faixa é duplicada uma vez — a animação
// (.animate-marquee, definida em globals.css) translada -50%, ou seja,
// exatamente o fim da primeira cópia. O espaço entre os prints é padding
// de cada item (não `gap`) pra as duas metades terem a mesma largura.
export default function Testimonials() {
  const track = [...testimonialScreenshots, ...testimonialScreenshots];

  return (
    <section id="depoimentos" className="overflow-hidden bg-ink py-24 sm:py-32">
      <Container>
        <SectionHeading title="Quem viveu, recomenda." light />
      </Container>

      <div className="relative mt-16">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent sm:w-32" />

        <div className="flex w-max animate-marquee">
          {track.map((shot, index) => (
            <div key={`${shot.src}-${index}`} className="shrink-0 pr-5">
              <div className="h-72 overflow-hidden rounded-2xl border border-cream/10 sm:h-80 lg:h-96">
                <Image
                  src={shot.src}
                  alt="Depoimento de cliente da Rosa Buffet"
                  width={shot.w}
                  height={shot.h}
                  // Largura real na tela (altura máx. 384px no desktop): sem
                  // isto o Next baixava cada print com 1920px, ~700 MB de
                  // imagem decodificada no carrossel — pesado demais no iPhone.
                  sizes={`${Math.ceil((384 * shot.w) / shot.h)}px`}
                  // Todos carregados de uma vez: a faixa se move, e print
                  // entrando em branco na tela quebrava a ilusão do infinito.
                  loading="eager"
                  className="h-full w-auto object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <WrittenTestimonials />
    </section>
  );
}
