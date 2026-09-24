import { requireSession } from "@/lib/crm/require-session";
import {
  DEFAULT_CONDICOES_PAGAMENTO,
  DEFAULT_LINK_AVALIACAO_GOOGLE,
  DEFAULT_MODELOS_WHATSAPP,
  getSetting,
} from "@/lib/crm/settings";
import type { ModelosWhatsapp } from "@/lib/crm/settings";
import {
  CondicoesPagamentoForm,
  LinkAvaliacaoForm,
  ModelosWhatsappForm,
} from "@/components/crm/SettingsForms";

export const dynamic = "force-dynamic";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-cream/10 bg-cream/5 p-5">
      <h2 className="font-display text-xl text-cream">{title}</h2>
      {description && <p className="mt-1 text-sm text-cream/60">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function CrmConfiguracoesPage() {
  await requireSession();

  const [condicoesPagamento, linkAvaliacao, modelosWhatsapp] = await Promise.all([
    getSetting("condicoes_pagamento", DEFAULT_CONDICOES_PAGAMENTO),
    getSetting("link_avaliacao_google", DEFAULT_LINK_AVALIACAO_GOOGLE),
    getSetting<ModelosWhatsapp>("modelos_whatsapp", DEFAULT_MODELOS_WHATSAPP),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-cream">Configurações</h1>
      <p className="mt-2 text-sm text-cream/60">
        Ajustes do CRM: valem para novos orçamentos, mensagens e o funcionamento do simulador.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <Section
          title="Condições de pagamento"
          description="Aparece no orçamento em PDF."
        >
          <CondicoesPagamentoForm value={condicoesPagamento} />
        </Section>

        <Section
          title="Link de avaliação no Google"
          description="Usado na mensagem pós-festa, quando preenchido."
        >
          <LinkAvaliacaoForm value={linkAvaliacao} />
        </Section>

        <Section
          title="Mensagens de WhatsApp"
          description="Modelos usados no botão de WhatsApp da ficha do lead, por fase do funil."
        >
          <ModelosWhatsappForm value={modelosWhatsapp} />
        </Section>

        <Section title="Pacotes e preços">
          <p className="text-sm text-cream/50">Em breve.</p>
        </Section>

        <Section title="Google Agenda">
          <p className="text-sm text-cream/50">Em breve.</p>
        </Section>
      </div>
    </div>
  );
}
