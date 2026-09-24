"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarPlus } from "lucide-react";
import VisitaActions, { VisitaStatusBadge } from "@/components/crm/VisitaActions";
import { createVisitaManualAction } from "@/lib/crm/visitas-actions";
import { getFreeSlotsAction } from "@/lib/visita/actions";
import type { DiaComHorarios, Visita } from "@/lib/visitas";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function LeadVisitasSection({
  leadId,
  nome,
  telefone,
  visitasIniciais,
}: {
  leadId: string;
  nome: string;
  telefone: string;
  visitasIniciais: Visita[];
}) {
  const [visitas, setVisitas] = useState(visitasIniciais);
  const [agendando, setAgendando] = useState(false);
  const [dias, setDias] = useState<DiaComHorarios[] | null>(null);
  const [dataEscolhida, setDataEscolhida] = useState("");
  const [horaEscolhida, setHoraEscolhida] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (agendando && dias === null) {
      getFreeSlotsAction().then(setDias);
    }
  }, [agendando, dias]);

  const horariosDoDia = dias?.find((d) => d.data === dataEscolhida)?.horarios ?? [];

  const agendar = () => {
    if (!dataEscolhida || !horaEscolhida) return;
    setErro(null);
    startTransition(async () => {
      const result = await createVisitaManualAction({
        leadId,
        nome,
        telefone,
        data: dataEscolhida,
        hora: horaEscolhida,
      });
      if (!result.ok) {
        setErro(result.erro === "horario_ocupado" ? "Esse horário acabou de ser ocupado." : "Não deu para agendar.");
        return;
      }
      setVisitas((prev) => [result.visita, ...prev]);
      setAgendando(false);
      setDataEscolhida("");
      setHoraEscolhida("");
      setDias(null);
    });
  };

  return (
    <section className="mt-6 rounded-xl border border-cream/10 bg-cream/5 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg text-cream">Visitas</h2>
        {!agendando && (
          <button
            type="button"
            onClick={() => setAgendando(true)}
            className="focus-gold flex items-center gap-1.5 rounded-full bg-cream/10 px-3.5 py-2 text-xs font-semibold text-cream hover:bg-cream/15"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Agendar visita
          </button>
        )}
      </div>

      {agendando && (
        <div className="mb-5 rounded-lg border border-cream/10 bg-ink p-4">
          {dias === null ? (
            <p className="text-sm text-cream/60">Carregando horários...</p>
          ) : dias.length === 0 ? (
            <p className="text-sm text-cream/60">Nenhum horário livre configurado.</p>
          ) : (
            <>
              <label className="mb-1.5 block text-xs font-medium text-cream/70">Dia</label>
              <select
                value={dataEscolhida}
                onChange={(e) => {
                  setDataEscolhida(e.target.value);
                  setHoraEscolhida("");
                }}
                className="focus-gold w-full rounded-lg border border-cream/15 bg-ink px-3 py-2 text-sm text-cream outline-none focus:border-gold"
              >
                <option value="">Selecione...</option>
                {dias.map((d) => (
                  <option key={d.data} value={d.data}>
                    {dateFormatter.format(new Date(`${d.data}T12:00:00`))}
                  </option>
                ))}
              </select>

              {dataEscolhida && (
                <>
                  <label className="mb-1.5 mt-3 block text-xs font-medium text-cream/70">Horário</label>
                  <div className="flex flex-wrap gap-2">
                    {horariosDoDia.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHoraEscolhida(h)}
                        className={`focus-gold rounded-lg border px-3 py-1.5 text-sm ${
                          horaEscolhida === h ? "border-gold bg-gold/15 text-gold" : "border-cream/15 text-cream"
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {erro && <p className="mt-3 text-sm text-red-400">{erro}</p>}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              disabled={!dataEscolhida || !horaEscolhida || isPending}
              onClick={agendar}
              className="focus-gold rounded-full bg-gold px-4 py-2 text-xs font-semibold text-ink hover:bg-gold-soft disabled:opacity-50"
            >
              {isPending ? "Agendando..." : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={() => setAgendando(false)}
              className="focus-gold text-xs text-cream/60 hover:text-cream"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {visitas.length === 0 ? (
        <p className="text-sm text-cream/60">Nenhuma visita agendada.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visitas.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-cream/10 pt-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-cream">
                    {dateFormatter.format(new Date(`${v.data}T12:00:00`))} às {v.hora}
                  </span>
                  <VisitaStatusBadge status={v.status} />
                </div>
              </div>
              <VisitaActions
                visitaId={v.id}
                status={v.status}
                leadId={leadId}
                nome={v.nome}
                telefone={v.telefone}
                data={v.data}
                hora={v.hora}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
