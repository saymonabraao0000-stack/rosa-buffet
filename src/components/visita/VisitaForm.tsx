"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Check, Clock, Download, MapPin } from "lucide-react";
import Container from "@/components/ui/Container";
import { createVisitaAction } from "@/lib/visita/actions";
import { siteConfig, buildWhatsappUrl } from "@/lib/site-config";
import type { DiaComHorarios } from "@/lib/visitas";

const dateFormatterCurto = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "America/Manaus",
});

const dateFormatterCompleto = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "America/Manaus",
});

type Step = "dia" | "hora" | "dados" | "sucesso";

export default function VisitaForm({
  dias,
  nomeInicial,
  telefoneInicial,
  origem,
}: {
  dias: DiaComHorarios[];
  nomeInicial: string;
  telefoneInicial: string;
  origem?: string;
}) {
  const [step, setStep] = useState<Step>("dia");
  const [dataEscolhida, setDataEscolhida] = useState<string | null>(null);
  const [horaEscolhida, setHoraEscolhida] = useState<string | null>(null);
  const [nome, setNome] = useState(nomeInicial);
  const [telefone, setTelefone] = useState(telefoneInicial);
  const [empresa, setEmpresa] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [visitaId, setVisitaId] = useState<string | null>(null);
  const dadosShownAtRef = useRef<number | null>(null);

  const horariosDoDia = useMemo(
    () => dias.find((d) => d.data === dataEscolhida)?.horarios ?? [],
    [dias, dataEscolhida],
  );

  const goToDados = () => {
    dadosShownAtRef.current = Date.now();
    setStep("dados");
  };

  const handleSubmit = async () => {
    if (!dataEscolhida || !horaEscolhida || !nome.trim() || telefone.replace(/\D/g, "").length < 10) return;
    setIsSubmitting(true);
    setErro(null);
    const elapsedMs = dadosShownAtRef.current ? Date.now() - dadosShownAtRef.current : 0;
    const result = await createVisitaAction({
      nome: nome.trim(),
      telefone,
      data: dataEscolhida,
      hora: horaEscolhida,
      origem,
      empresa,
      elapsedMs,
    });
    setIsSubmitting(false);
    if (!result.ok) {
      if (result.erro === "horario_ocupado") {
        setErro("Esse horário acabou de ser ocupado. Escolha outro, por favor.");
        setStep("hora");
      } else {
        setErro("Não deu para agendar. Confira o nome e o telefone.");
      }
      return;
    }
    setVisitaId(result.visita.id);
    setStep("sucesso");
  };

  if (step === "sucesso" && dataEscolhida && horaEscolhida) {
    const whatsappUrl = buildWhatsappUrl(
      `Olá! Agendei uma visita ao salão para ${dateFormatterCompleto.format(
        new Date(`${dataEscolhida}T12:00:00`),
      )} às ${horaEscolhida}. Meu nome é ${nome}.`,
    );
    return (
      <Container className="max-w-lg">
        <div className="rounded-2xl border border-cream/10 bg-cream/5 p-8 text-center shadow-sm">
          <Check className="mx-auto h-10 w-10 text-gold" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl text-cream sm:text-3xl">Visita agendada!</h1>
          <p className="mt-2 text-sm text-cream/65">
            {dateFormatterCompleto.format(new Date(`${dataEscolhida}T12:00:00`))} às {horaEscolhida}
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-cream/10 bg-ink/60 p-4 text-left text-sm text-cream/65">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
            <div>
              <p className="font-medium text-cream">{siteConfig.address.full}</p>
              <a
                href={siteConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-gold text-gold underline underline-offset-2"
              >
                Como chegar
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {visitaId && (
              <a
                href={`/visita/${visitaId}/ics`}
                className="focus-gold inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-cream/20 px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Adicionar ao calendário
              </a>
            )}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-gold inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
            >
              Confirmar pelo WhatsApp
            </a>
          </div>

          <Link href="/" className="focus-gold mt-6 inline-block text-sm text-cream/65 underline underline-offset-2 hover:text-cream">
            Voltar ao site
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="max-w-lg">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl text-cream sm:text-4xl">Agende uma visita ao salão</h1>
        <p className="mt-2 text-sm text-cream/65">
          Conheça o espaço pessoalmente com a nossa equipe.
        </p>
      </div>

      <div className="rounded-2xl border border-cream/10 bg-cream/5 p-6 shadow-sm sm:p-8">
        <AnimatePresence mode="wait">
          {step === "dia" && (
            <motion.div key="dia" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <h2 className="flex items-center gap-2 font-display text-xl text-cream">
                <Calendar className="h-5 w-5 text-gold" aria-hidden="true" />
                Escolha um dia
              </h2>
              {dias.length === 0 ? (
                <p className="mt-4 text-sm text-cream/65">
                  Não há horários livres no momento. Fale com a gente pelo WhatsApp.
                </p>
              ) : (
                <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                  {dias.map((d) => {
                    const partes = dateFormatterCurto.formatToParts(new Date(`${d.data}T12:00:00`));
                    const dia = partes.find((p) => p.type === "day")?.value;
                    const mes = partes.find((p) => p.type === "month")?.value;
                    const semana = partes.find((p) => p.type === "weekday")?.value;
                    return (
                      <button
                        key={d.data}
                        type="button"
                        onClick={() => {
                          setDataEscolhida(d.data);
                          setHoraEscolhida(null);
                          setStep("hora");
                        }}
                        className={`focus-gold flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-4 py-3 text-center transition-colors ${
                          dataEscolhida === d.data ? "border-gold bg-gold/15" : "border-cream/10 hover:border-gold/60"
                        }`}
                      >
                        <span className="text-[11px] uppercase text-cream/65">{semana}</span>
                        <span className="font-display text-lg text-cream">{dia}</span>
                        <span className="text-[11px] text-cream/65">{mes}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {step === "hora" && dataEscolhida && (
            <motion.div key="hora" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <h2 className="flex items-center gap-2 font-display text-xl text-cream">
                <Clock className="h-5 w-5 text-gold" aria-hidden="true" />
                Horários em {dateFormatterCompleto.format(new Date(`${dataEscolhida}T12:00:00`))}
              </h2>
              {erro && <p className="mt-3 text-sm text-red-300">{erro}</p>}
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {horariosDoDia.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      setHoraEscolhida(h);
                      goToDados();
                    }}
                    className={`focus-gold rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      horaEscolhida === h ? "border-gold bg-gold/15 text-cream" : "border-cream/10 text-cream hover:border-gold/60"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep("dia")}
                className="focus-gold mt-5 text-sm font-medium text-cream/65 underline-offset-2 hover:text-cream hover:underline"
              >
                Escolher outro dia
              </button>
            </motion.div>
          )}

          {step === "dados" && dataEscolhida && horaEscolhida && (
            <motion.div key="dados" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <h2 className="font-display text-xl text-cream">Seus dados</h2>
              <p className="mt-1 text-sm text-cream/65">
                {dateFormatterCompleto.format(new Date(`${dataEscolhida}T12:00:00`))} às {horaEscolhida}
              </p>

              {erro && <p className="mt-3 text-sm text-red-300">{erro}</p>}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="mt-5 flex flex-col gap-4"
              >
                {/* Honeypot: só robô preenche. Escondido visualmente, mas acessível a bots simples. */}
                <input
                  type="text"
                  name="empresa"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />

                <div>
                  <label htmlFor="visita-nome" className="mb-1.5 block text-sm font-medium text-cream">
                    Nome
                  </label>
                  <input
                    id="visita-nome"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="focus-gold w-full rounded-lg border border-cream/20 bg-ink px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none [color-scheme:dark] focus:border-gold"
                  />
                </div>
                <div>
                  <label htmlFor="visita-telefone" className="mb-1.5 block text-sm font-medium text-cream">
                    WhatsApp
                  </label>
                  <input
                    id="visita-telefone"
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(92) 99999-9999"
                    className="focus-gold w-full rounded-lg border border-cream/20 bg-ink px-4 py-3 text-sm text-cream placeholder:text-cream/35 outline-none [color-scheme:dark] focus:border-gold"
                  />
                </div>

                <div className="mt-2 flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="focus-gold inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "Agendando..." : "Confirmar visita"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("hora")}
                    className="focus-gold text-sm font-medium text-cream/65 underline-offset-2 hover:text-cream hover:underline"
                  >
                    Voltar
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Container>
  );
}
