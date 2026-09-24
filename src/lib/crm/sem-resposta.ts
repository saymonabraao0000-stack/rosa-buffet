import "server-only";
import { sql } from "@/lib/db/client";

// Alerta de lead sem resposta: lead que veio do simulador e continua "novo"
// 1 hora depois ganha um segundo aviso no celular (ntfy), uma vez só
// (leads.alerta_sem_resposta_em). Chamado a cada 15 min pelo cron
// (custom-worker.ts → POST /api/cron/sem-resposta).

const ESPERA_MINUTOS = 60;
// Janela máxima: lead mais antigo que isso não gera alerta (evita avisar em
// massa leads velhos, por exemplo na primeira execução).
const JANELA_DIAS = 3;
// Silêncio de madrugada (horário de Manaus): quem passar de 1h entre 22h e
// 7h é avisado na primeira execução das 7h.
const HORA_INICIO = 7;
const HORA_FIM = 22;

function horaEmManaus(agora = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Manaus", hour: "numeric", hourCycle: "h23" }).format(agora),
  );
}

export type AlertaSemResposta = { titulo: string; texto: string; caminho: string };

/**
 * Procura os leads sem resposta, marca como avisados e devolve o texto do
 * aviso (ou null se não há nada a avisar / é madrugada). Marca ANTES de
 * enviar: se o envio falhar, o lead não é avisado de novo — preferível a
 * repetir avisos a cada 15 minutos.
 */
export async function coletarAlertaSemResposta(): Promise<AlertaSemResposta | null> {
  const hora = horaEmManaus();
  if (hora < HORA_INICIO || hora >= HORA_FIM) return null;

  const rows = (await sql`
    update leads
    set alerta_sem_resposta_em = now(), updated_at = now()
    where source = 'quiz'
      and status = 'novo'
      and alerta_sem_resposta_em is null
      and created_at <= now() - make_interval(mins => ${ESPERA_MINUTOS})
      and created_at >= now() - make_interval(days => ${JANELA_DIAS})
    returning id, nome
  `) as { id: string; nome: string }[];

  if (rows.length === 0) return null;

  const primeiros = rows.map((r) => r.nome.trim().split(/\s+/)[0] || "Alguém");
  if (rows.length === 1) {
    return {
      titulo: "Lead sem resposta - Rosa Buffet",
      texto: `${primeiros[0]} fez a simulação há mais de 1 hora e ainda está como "Novo". Toque para abrir a ficha.`,
      caminho: `/crm/leads/${rows[0].id}`,
    };
  }
  const nomes = primeiros.slice(0, 4).join(", ") + (rows.length > 4 ? ` e mais ${rows.length - 4}` : "");
  return {
    titulo: "Leads sem resposta - Rosa Buffet",
    texto: `${rows.length} leads estão há mais de 1 hora sem contato: ${nomes}. Toque para ver a lista.`,
    caminho: "/crm/leads?status=novo",
  };
}
