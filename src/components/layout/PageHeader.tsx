import type { ReactNode } from "react";
import Container from "@/components/ui/Container";

/**
 * Topo escuro das páginas institucionais (/sobre, /servicos, /depoimentos,
 * /onde-estamos). Fundo escuro de propósito: a logo dourada da Navbar some
 * em fundo claro.
 */
export default function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink pb-16 pt-36 text-cream sm:pt-40">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <Container className="relative flex flex-col items-center gap-5 text-center">
        <h1 className="max-w-3xl font-display text-4xl leading-tight sm:text-5xl md:text-6xl">{title}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-cream/75 sm:text-lg">{description}</p>
        {children}
      </Container>
    </section>
  );
}
