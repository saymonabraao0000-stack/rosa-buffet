import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTestimonialByToken } from "@/lib/crm/testimonials";
import TestimonialForm from "@/components/public/TestimonialForm";
import { siteConfig } from "@/lib/site-config";

// Página pública (fora do CRM), aberta pelo cliente a partir do link
// gerado na ficha do lead. Não é indexada e não expõe nenhum dado de outro
// lead — só o token da URL identifica o pedido de depoimento.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deixe seu depoimento",
  robots: { index: false, follow: false },
};

export default async function DepoimentoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const testimonial = await getTestimonialByToken(token);

  return (
    <main className="flex min-h-svh flex-col bg-cream">
      <header className="border-b border-ink/10 bg-white/60 px-4 py-5">
        <div className="mx-auto flex w-[min(640px,100%)] items-center justify-center">
          <Link href="/" className="focus-gold block rounded-full">
            <Image
              src="/images/logo-header.png"
              alt="Rosa Buffet"
              width={900}
              height={235}
              priority
              className="h-7 w-auto"
            />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center px-4 py-10 sm:py-16">
        <div className="w-[min(560px,100%)]">
          {!testimonial ? (
            <div className="rounded-2xl border border-ink/10 bg-white px-6 py-10 text-center">
              <p className="font-display text-xl text-ink">Link não encontrado</p>
              <p className="mt-2 text-sm text-gray-dark">
                Esse link de depoimento não existe ou não é mais válido. Se você recebeu ele da nossa
                equipe, confirme com a Rosa Buffet pelo WhatsApp.
              </p>
            </div>
          ) : testimonial.respondidoEm ? (
            <div className="rounded-2xl border border-gold/30 bg-gold/10 px-6 py-10 text-center">
              <p className="font-display text-xl text-ink">Obrigado, já recebemos!</p>
              <p className="mt-2 text-sm text-gray-dark">
                Seu depoimento já foi enviado anteriormente. Muito obrigado por ter feito parte da sua
                festa com a gente 💛
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                {siteConfig.fullName}
              </p>
              <h1 className="mt-3 font-display text-2xl text-ink sm:text-3xl">
                Como foi a sua festa?
              </h1>
              <p className="mt-2 text-sm text-gray-dark">
                A sua opinião ajuda muito outras famílias a conhecerem nosso trabalho. Leva menos de um
                minuto.
              </p>

              <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
                <TestimonialForm token={token} nomeInicial={testimonial.nome ?? ""} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
