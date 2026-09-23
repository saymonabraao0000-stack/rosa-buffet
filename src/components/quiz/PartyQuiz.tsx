"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronUp,
  PartyPopper,
  RotateCcw,
} from "lucide-react";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import QuizCalendar from "@/components/quiz/QuizCalendar";
import { reservationDeposit, formatISODate } from "@/lib/availability-data";
import { createLeadAction, updateLeadAction } from "@/lib/quiz/actions";
import type { LeadProgressPatch } from "@/lib/crm/types";
import {
  getPackagePrice,
  guestOptions,
  partyPackages,
  quizThemes,
} from "@/lib/quiz-data";

const STEPS = [
  "welcome",
  "contato",
  "tema",
  "convidados",
  "data",
  "pacote",
  "resultado",
] as const;

type Step = (typeof STEPS)[number];

const ANSWERABLE_STEPS: Step[] = ["contato", "tema", "convidados", "data", "pacote"];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function letterFor(index: number) {
  return String.fromCharCode(65 + index);
}

type Answers = {
  nome: string;
  telefone: string;
  leadId: string | null;
  temaSlug: string | null;
  guestSlug: string | null;
  date: Date | null;
  dateSkipped: boolean;
  pacoteSlug: string | null;
};

const initialAnswers: Answers = {
  nome: "",
  telefone: "",
  leadId: null,
  temaSlug: null,
  guestSlug: null,
  date: null,
  dateSkipped: false,
  pacoteSlug: null,
};

type PartyQuizProps = {
  bookedDates: string[];
};

export default function PartyQuiz({ bookedDates }: PartyQuizProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const step = STEPS[stepIndex];

  const tema = quizThemes.find((t) => t.slug === answers.temaSlug) ?? null;
  const guestOption = guestOptions.find((g) => g.slug === answers.guestSlug) ?? null;
  const pacote = partyPackages.find((p) => p.slug === answers.pacoteSlug) ?? null;

  const price = useMemo(() => {
    if (!pacote || !guestOption) return null;
    return getPackagePrice(pacote.slug, guestOption.guests);
  }, [pacote, guestOption]);

  const canAdvance = (() => {
    switch (step) {
      case "contato":
        return (
          answers.nome.trim().length >= 2 &&
          answers.telefone.replace(/\D/g, "").length >= 10
        );
      case "tema":
        return !!answers.temaSlug;
      case "convidados":
        return !!answers.guestSlug;
      case "data":
        return answers.dateSkipped || !!answers.date;
      case "pacote":
        return !!answers.pacoteSlug;
      default:
        return true;
    }
  })();

  const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const goPrev = () => setStepIndex((i) => Math.max(i - 1, 0));

  // Salva a resposta no servidor sem travar a navegação: dispara a Server
  // Action e já avança, sem esperar o resultado (erro de rede não deve
  // interromper o quiz — só fica sem registrar aquele passo específico).
  const saveProgress = (patch: LeadProgressPatch) => {
    if (!answers.leadId) return;
    void updateLeadAction(answers.leadId, patch).catch(() => {});
  };

  const selectAndAdvance = (localPatch: Partial<Answers>, dbPatch: LeadProgressPatch) => {
    setAnswers((a) => ({ ...a, ...localPatch }));
    saveProgress({ ...dbPatch, currentStep: step });
    setTimeout(goNext, 350);
  };

  const handleContatoSubmit = async () => {
    if (!canAdvance || isSubmittingLead) return;
    setIsSubmittingLead(true);
    const { id } = await createLeadAction({
      nome: answers.nome.trim(),
      telefone: answers.telefone.trim(),
    });
    setAnswers((a) => ({ ...a, leadId: id }));
    setIsSubmittingLead(false);
    goNext();
  };

  const handleDataContinue = () => {
    saveProgress({
      dataEvento: answers.dateSkipped || !answers.date ? null : formatISODate(answers.date),
      dataSkipped: answers.dateSkipped,
      currentStep: "data",
    });
    goNext();
  };

  const handleDataSkip = () => {
    setAnswers((a) => ({ ...a, date: null, dateSkipped: true }));
    saveProgress({ dataEvento: null, dataSkipped: true, currentStep: "data" });
    goNext();
  };

  const selectPackageAndAdvance = (pacoteSlug: string) => {
    const pkgPrice = guestOption ? getPackagePrice(pacoteSlug, guestOption.guests) : null;
    selectAndAdvance(
      { pacoteSlug },
      {
        buffetTierSlug: pacoteSlug,
        ...(pkgPrice != null ? { estimateMin: pkgPrice, estimateMax: pkgPrice } : {}),
      },
    );
  };

  // Enter avança nas duas primeiras etapas (boas-vindas e contato); as
  // demais têm botão próprio ou avançam sozinhas ao escolher — a de data tem
  // botão próprio porque tem uma nota (sinal) que vale a pena o usuário ler
  // antes de seguir.
  useEffect(() => {
    if (step !== "welcome" && step !== "contato") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !canAdvance) return;
      if (step === "contato") void handleContatoSubmit();
      else goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, canAdvance, answers.nome, answers.telefone, isSubmittingLead]);

  const progress =
    step === "welcome"
      ? 0
      : step === "resultado"
        ? 100
        : ((ANSWERABLE_STEPS.indexOf(step) + 1) / ANSWERABLE_STEPS.length) * 100;

  const whatsappMessage = useMemo(() => {
    if (!pacote || !guestOption) return "";
    const lines = [
      `Olá! Fiz uma simulação no site e gostaria de um orçamento para minha festa.`,
      answers.nome ? `Nome: ${answers.nome}` : null,
      tema ? `Tema: ${tema.label}` : null,
      `Convidados: ${guestOption.label}`,
      answers.dateSkipped
        ? `Data: ainda não decidida`
        : answers.date
          ? `Data desejada: ${dateFormatter.format(answers.date)}`
          : null,
      `Pacote: ${pacote.label}`,
      price != null
        ? `Valor do pacote: ${currency.format(price)}`
        : `Valor: sob consulta (mais de 150 convidados)`,
      `Podem confirmar disponibilidade e fechar os detalhes?`,
    ].filter(Boolean);
    return lines.join("\n");
  }, [answers, tema, guestOption, pacote, price]);

  return (
    <div className="relative flex min-h-screen flex-col bg-cream">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="focus-gold rounded-full">
          <Image
            src="/images/logo-header.png"
            alt="Rosa Buffet"
            width={900}
            height={235}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <Link
          href="/"
          className="focus-gold text-sm font-medium text-gray-dark transition-colors hover:text-ink"
        >
          Sair da simulação
        </Link>
      </header>

      <div className="h-1 w-full bg-gray-light">
        <motion.div
          className="h-full bg-gold"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {step !== "welcome" && step !== "resultado" && (
                <div className="reveal mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gold">
                    {String(ANSWERABLE_STEPS.indexOf(step) + 1).padStart(2, "0")}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="focus-gold flex items-center gap-1 text-sm font-medium text-gray-dark hover:text-ink"
                  >
                    <ChevronUp className="h-3.5 w-3.5 -rotate-90" aria-hidden="true" />
                    Voltar
                  </button>
                </div>
              )}

              {step === "welcome" && (
                <div>
                  <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
                    Vamos montar o projeto da sua festa?
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-dark sm:text-lg">
                    Responda algumas perguntas rápidas sobre tema, convidados e
                    estilo do evento e receba uma estimativa de valor na hora.
                    Depois é só confirmar os detalhes com a gente pelo WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={goNext}
                    className="focus-gold mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-soft"
                  >
                    Começar simulação
                  </button>
                  <p className="mt-3 text-sm text-gray-dark">
                    Leva menos de 2 minutos · pressione{" "}
                    <span className="font-semibold text-ink">Enter</span>
                  </p>
                </div>
              )}

              {step === "contato" && (
                <div>
                  <h2 className="font-display text-2xl text-ink sm:text-3xl">
                    Para começar, qual é o seu nome e WhatsApp?
                  </h2>
                  <p className="mt-2 text-sm text-gray-dark">
                    É só pra garantirmos que alguém da nossa equipe fala com
                    você, mesmo que dê pra terminar a simulação depois.
                  </p>
                  <input
                    autoFocus
                    type="text"
                    value={answers.nome}
                    onChange={(e) => setAnswers((a) => ({ ...a, nome: e.target.value }))}
                    placeholder="Digite seu nome..."
                    className="focus-gold mt-6 w-full border-b-2 border-ink/20 bg-transparent pb-3 text-xl text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                  />
                  <input
                    type="tel"
                    value={answers.telefone}
                    onChange={(e) => setAnswers((a) => ({ ...a, telefone: e.target.value }))}
                    placeholder="(92) 99999-9999"
                    className="focus-gold mt-5 w-full border-b-2 border-ink/20 bg-transparent pb-3 text-xl text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                  />
                  <div className="mt-6 flex items-center gap-4">
                    <button
                      type="button"
                      disabled={!canAdvance || isSubmittingLead}
                      onClick={() => void handleContatoSubmit()}
                      className="focus-gold inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isSubmittingLead ? "Enviando..." : "OK"}
                      {!isSubmittingLead && <Check className="h-4 w-4" aria-hidden="true" />}
                    </button>
                    <span className="text-sm text-gray-dark">
                      pressione <span className="font-semibold text-ink">Enter</span>
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-gray-dark">
                    Ao continuar, você concorda com nossa{" "}
                    <Link
                      href="/privacidade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-gold font-medium text-ink underline underline-offset-2 hover:text-gold"
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </p>
                </div>
              )}

              {step === "tema" && (
                <div>
                  <h2 className="font-display text-2xl text-ink sm:text-3xl">
                    {answers.nome ? `${answers.nome}, qual` : "Qual"} é o tema da festa?
                  </h2>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {quizThemes.map((t, i) => (
                      <button
                        key={t.slug}
                        type="button"
                        onClick={() => selectAndAdvance({ temaSlug: t.slug }, { temaSlug: t.slug })}
                        className={`focus-gold group relative overflow-hidden rounded-xl border text-left transition-all ${
                          answers.temaSlug === t.slug
                            ? "border-gold ring-2 ring-gold"
                            : "border-ink/10 hover:border-gold/60"
                        }`}
                      >
                        {t.image ? (
                          <div className="relative h-24 w-full sm:h-28">
                            <Image
                              src={t.image}
                              alt=""
                              fill
                              sizes="200px"
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-ink/25 transition-opacity group-hover:bg-ink/10" />
                          </div>
                        ) : (
                          <div className="flex h-24 w-full items-center justify-center bg-gray-light sm:h-28">
                            <PartyPopper className="h-8 w-8 text-gold" aria-hidden="true" />
                          </div>
                        )}
                        <span className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-ink">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-ink/15 text-[11px] font-semibold text-gray-dark">
                            {letterFor(i)}
                          </span>
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "convidados" && (
                <div>
                  <h2 className="font-display text-2xl text-ink sm:text-3xl">
                    Mais ou menos quantos convidados?
                  </h2>
                  <div className="mt-6 flex flex-col gap-3">
                    {guestOptions.map((g, i) => (
                      <button
                        key={g.slug}
                        type="button"
                        onClick={() =>
                          selectAndAdvance(
                            { guestSlug: g.slug },
                            {
                              guestRangeSlug: g.slug,
                              ...(g.guests != null ? { estimatedGuests: g.guests } : {}),
                            },
                          )
                        }
                        className={`focus-gold flex items-center gap-3 rounded-xl border px-5 py-4 text-left text-ink transition-colors ${
                          answers.guestSlug === g.slug
                            ? "border-gold bg-gold-soft/15"
                            : "border-ink/10 hover:border-gold/60"
                        }`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-ink/15 text-xs font-semibold text-gray-dark">
                          {letterFor(i)}
                        </span>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "data" && (
                <div>
                  <h2 className="font-display text-2xl text-ink sm:text-3xl">
                    Já tem uma data em mente?
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-dark">
                    Datas em cinza já estão reservadas por outro evento. Para
                    garantir a data escolhida, a Rosa Buffet pede um sinal de{" "}
                    <span className="font-semibold text-ink">
                      {currency.format(reservationDeposit)}
                    </span>
                    .
                  </p>
                  <div className="mt-6">
                    <QuizCalendar
                      value={answers.date}
                      bookedDates={bookedDates}
                      onSelect={(date) => setAnswers((a) => ({ ...a, date, dateSkipped: false }))}
                    />
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      disabled={!canAdvance}
                      onClick={handleDataContinue}
                      className="focus-gold inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Continuar
                    </button>
                    <button
                      type="button"
                      onClick={handleDataSkip}
                      className="focus-gold text-sm font-medium text-gray-dark underline-offset-2 hover:text-ink hover:underline"
                    >
                      Ainda não sei a data
                    </button>
                  </div>
                </div>
              )}

              {step === "pacote" && (
                <div>
                  <h2 className="font-display text-2xl text-ink sm:text-3xl">
                    Qual pacote combina com a festa?
                  </h2>
                  <p className="mt-2 text-sm text-gray-dark">
                    Os dois já incluem cerimonial, fotografia, bolo de 3 andares, decoração
                    completa, DJ e cabine fotográfica — a diferença está abaixo.
                  </p>
                  <div className="mt-6 flex flex-col gap-3">
                    {partyPackages
                      .filter((p) => !p.themes || p.themes.includes(answers.temaSlug ?? ""))
                      .map((p, i) => {
                      const pkgPrice = guestOption ? getPackagePrice(p.slug, guestOption.guests) : null;
                      return (
                        <button
                          key={p.slug}
                          type="button"
                          onClick={() => selectPackageAndAdvance(p.slug)}
                          className={`focus-gold flex items-start gap-3 rounded-xl border px-5 py-4 text-left transition-colors ${
                            answers.pacoteSlug === p.slug
                              ? "border-gold bg-gold-soft/15"
                              : "border-ink/10 hover:border-gold/60"
                          }`}
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-ink/15 text-xs font-semibold text-gray-dark">
                            {letterFor(i)}
                          </span>
                          <span>
                            <span className="block font-semibold text-ink">
                              {p.label} — {p.tagline}
                            </span>
                            <ul className="mt-1 list-disc pl-4 text-sm text-gray-dark">
                              {p.highlights.map((h) => (
                                <li key={h}>{h}</li>
                              ))}
                            </ul>
                            <span className="mt-1.5 block text-sm font-semibold text-gold">
                              {pkgPrice != null
                                ? `${currency.format(pkgPrice)} para ${guestOption?.label.toLowerCase()}`
                                : "Sob consulta"}
                            </span>
                            {p.note && (
                              <span className="mt-1 block text-xs text-gray-dark">{p.note}</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === "resultado" && pacote && guestOption && (
                <div>
                  <PartyPopper className="h-9 w-9 text-gold" aria-hidden="true" />
                  <h2 className="mt-4 font-display text-2xl text-ink sm:text-3xl">
                    Prontinho{answers.nome ? `, ${answers.nome}` : ""}! Aqui está a
                    estimativa da sua festa.
                  </h2>

                  <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-gray-dark sm:grid-cols-2">
                    <div className="flex justify-between border-b border-ink/10 py-2 sm:justify-start sm:gap-2">
                      <dt className="font-medium text-ink">Tema:</dt>
                      <dd>{tema?.label}</dd>
                    </div>
                    <div className="flex justify-between border-b border-ink/10 py-2 sm:justify-start sm:gap-2">
                      <dt className="font-medium text-ink">Convidados:</dt>
                      <dd>{guestOption?.label}</dd>
                    </div>
                    <div className="flex justify-between border-b border-ink/10 py-2 sm:justify-start sm:gap-2">
                      <dt className="font-medium text-ink">Data:</dt>
                      <dd>
                        {answers.dateSkipped || !answers.date
                          ? "A definir"
                          : dateFormatter.format(answers.date)}
                      </dd>
                    </div>
                    <div className="col-span-full border-b border-ink/10 py-2">
                      <dt className="font-medium text-ink">Pacote:</dt>
                      <dd className="mt-1">{pacote.label} — {pacote.tagline}</dd>
                    </div>
                  </dl>

                  <div className="mt-8 rounded-2xl border border-gold/30 bg-gold-soft/10 px-6 py-6 text-center">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-dark">
                      Valor estimado
                    </span>
                    <p className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                      {price != null ? currency.format(price) : "Sob consulta"}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-gray-dark">
                      *Estimativa gerada pelo simulador, sujeita a confirmação com
                      nossa equipe. Não inclui taxas específicas do espaço ou
                      personalizações extras.
                      {!answers.dateSkipped && answers.date && (
                        <>
                          {" "}
                          Para reservar a data escolhida é pedido um sinal de{" "}
                          {currency.format(reservationDeposit)}.
                        </>
                      )}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <WhatsAppButton
                      size="lg"
                      label="Receber orçamento exato pelo WhatsApp"
                      message={whatsappMessage}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAnswers(initialAnswers);
                        setStepIndex(0);
                      }}
                      className="focus-gold inline-flex items-center gap-2 text-sm font-medium text-gray-dark hover:text-ink"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Refazer simulação
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
