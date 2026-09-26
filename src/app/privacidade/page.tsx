import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import WhatsAppChoice from "@/components/ui/WhatsAppChoice";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Rosa Buffet & Eventos coleta, usa e protege os dados pessoais enviados pelo site, e como exercer seus direitos previstos na LGPD.",
  alternates: {
    canonical: "/privacidade",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function PrivacidadePage() {
  return (
    <>
      <Navbar />
      {/* Faixa escura no topo: o Navbar é transparente com texto claro e
          sumia sobre o fundo creme. */}
      <header className="bg-ink pb-12 pt-32 text-cream sm:pb-16 sm:pt-36">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-3xl sm:text-4xl">Política de Privacidade</h1>
            <p className="mt-3 text-sm text-cream/65">Última atualização: setembro de 2026.</p>
          </div>
        </Container>
      </header>
      <main className="bg-cream py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col gap-8 text-base leading-relaxed text-gray-dark">
              <p>
                Esta página explica, de forma simples e direta, o que a{" "}
                <strong className="text-ink">{siteConfig.fullName}</strong>{" "}
                ({siteConfig.address.full}) faz com os dados pessoais que você
                nos envia pelo site — em especial pelo simulador de orçamento
                (<em>/orcamento</em>) e por qualquer formulário de contato.
                Seguimos a Lei Geral de Proteção de Dados (Lei nº 13.709/2018
                — LGPD).
              </p>

              <section>
                <h2 className="font-display text-xl text-ink">
                  Quem coleta
                </h2>
                <p className="mt-2">
                  A {siteConfig.fullName}, buffet e produtora de eventos em
                  Manaus-AM, é quem coleta e é responsável pelos dados
                  informados neste site.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-ink">
                  O que coletamos
                </h2>
                <p className="mt-2">Coletamos apenas o necessário para falar com você sobre o seu evento:</p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5">
                  <li>Nome e número de WhatsApp/telefone;</li>
                  <li>
                    As respostas que você dá no simulador de orçamento (tema
                    da festa, número aproximado de convidados, data
                    desejada e pacote escolhido);
                  </li>
                  <li>
                    Anotações que a nossa equipe registra internamente sobre
                    o atendimento ao seu contato.
                  </li>
                </ul>
                <p className="mt-3">
                  Não coletamos dados de pagamento, documentos pessoais nem
                  informações sensíveis pelo site.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-ink">
                  Para que usamos
                </h2>
                <p className="mt-2">
                  Usamos esses dados exclusivamente para entrar em contato
                  com você, entender melhor o que você precisa para o seu
                  evento e enviar um orçamento — nunca para vender a
                  terceiros, nem para envio de propaganda não relacionada ao
                  seu pedido.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-ink">
                  Onde ficam guardados
                </h2>
                <p className="mt-2">
                  Os dados ficam em um banco de dados com acesso restrito à
                  equipe da {siteConfig.name}, usado como painel interno de
                  atendimento a clientes (o nosso CRM). Ninguém fora da
                  empresa tem acesso a essas informações.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-ink">
                  Por quanto tempo guardamos
                </h2>
                <p className="mt-2">
                  Mantemos os dados enquanto durar o relacionamento com você
                  (do primeiro contato até o seu evento, e por um tempo
                  depois para eventual retorno seu) ou até você pedir a
                  exclusão, o que ocorrer primeiro.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-ink">
                  Seus direitos
                </h2>
                <p className="mt-2">
                  De acordo com a LGPD, você pode a qualquer momento pedir
                  para:
                </p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5">
                  <li>Confirmar se temos dados seus e acessá-los;</li>
                  <li>Corrigir dados incompletos ou desatualizados;</li>
                  <li>
                    Excluir os seus dados do nosso banco (respeitado o que a
                    lei exigir manter, se for o caso);
                  </li>
                  <li>Saber com quem compartilhamos seus dados (com ninguém, além da nossa própria equipe).</li>
                </ul>
                <p className="mt-3">
                  Para exercer qualquer um desses direitos, fale com a gente
                  pelo WhatsApp:{" "}
                  <WhatsAppChoice
                    ariaLabel={`WhatsApp da ${siteConfig.name}`}
                    menuAlign="left"
                    className="focus-gold font-semibold text-ink underline underline-offset-2 hover:text-gold"
                  >
                    {siteConfig.phoneDisplay}
                  </WhatsAppChoice>
                  .
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl text-ink">
                  Alterações desta política
                </h2>
                <p className="mt-2">
                  Podemos atualizar esta página conforme o site evolui. A
                  data no topo sempre indica a versão mais recente.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
