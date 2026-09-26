import "server-only";
import { sql } from "@/lib/db/client";
import { partyPackages } from "@/lib/quiz-data";

/**
 * Configurações editáveis do CRM, gravadas na tabela `settings`
 * (key/value jsonb). Toda leitura tem fallback para os padrões definidos
 * aqui embaixo — se a linha ainda não existir no banco (primeira vez, ou
 * setting nova), o código continua funcionando normalmente.
 */

export type ModelosWhatsapp = {
  primeiroContato: string;
  retomarSimulacao: string;
  cobrarOrcamento: string;
  reservaConfirmada: string;
  lembreteSaldo: string;
  posFesta: string;
};

/** `slug` do pacote → preço por faixa de convidados + nota, espelhando `partyPackages`. */
export type PrecosSetting = Record<
  string,
  {
    pricesByGuests: Record<number, number>;
    note?: string;
  }
>;

export const DEFAULT_CONDICOES_PAGAMENTO =
  "Sinal de R$ 2.000 na reserva da data; restante até 2 semanas antes da festa.";

export const DEFAULT_LINK_AVALIACAO_GOOGLE = "";

// Variáveis disponíveis nos modelos: {nome} {tema} {data} {valor} {saldo}
// {link_avaliacao} {link_depoimento}
export const DEFAULT_MODELOS_WHATSAPP: ModelosWhatsapp = {
  primeiroContato:
    "Oi, {nome}! Aqui é da Rosa Buffet 🌹 Vimos seu interesse em fazer uma festa de {tema} com a gente. " +
    "Podemos conversar sobre os detalhes e te ajudar a montar a festa ideal?",
  retomarSimulacao:
    "Oi, {nome}! Vi que você começou a simular o orçamento da sua festa de {tema} aqui no site e não terminou. " +
    "Posso te ajudar a fechar os detalhes e te passar os valores certinhos?",
  cobrarOrcamento:
    "Oi, {nome}! Passando para saber se você já conseguiu dar uma olhada no orçamento que te enviamos para a festa " +
    "de {tema} do dia {data}. Ficou alguma dúvida?",
  reservaConfirmada:
    "Oi, {nome}! Sua data ({data}) está reservada com a gente 🎉 Recebemos o sinal de {valor}, muito obrigado pela confiança! " +
    "Qualquer detalhe da festa é só chamar por aqui.",
  lembreteSaldo:
    "Oi, {nome}! Passando para lembrar que o saldo da sua festa do dia {data} é de {saldo}, com vencimento próximo. " +
    "Qualquer dúvida sobre o pagamento, é só falar com a gente.",
  posFesta:
    "Oi, {nome}! Foi uma alegria fazer parte da sua festa de {tema} 🌹 Esperamos que tenha sido um dia inesquecível! " +
    "Se puder, ficaríamos muito felizes com uma avaliação: {link_avaliacao}. " +
    "E se quiser deixar um depoimento pra gente, é só aqui: {link_depoimento}",
};

/** Deriva os preços padrão a partir de `partyPackages` (src/lib/quiz-data.ts). */
export function getDefaultPrecos(): PrecosSetting {
  const precos: PrecosSetting = {};
  for (const pkg of partyPackages) {
    precos[pkg.slug] = {
      pricesByGuests: { ...pkg.pricesByGuests },
      note: pkg.note,
    };
  }
  return precos;
}

/** Configurações de agendamento de visitas ao salão (setting `visitas_config`). */
export type VisitasConfig = {
  /** Dias da semana com visita (0=domingo .. 6=sábado). Padrão: terça a sábado. */
  diasSemana: number[];
  horaInicio: string; // "HH:MM"
  horaFim: string; // "HH:MM"
  duracaoMinutos: number;
  antecedenciaMinimaHoras: number;
  diasFrente: number;
  /** Se true (padrão), exclui dias com festa fechada ou bloqueados. */
  excluirDiasOcupados: boolean;
};

export const DEFAULT_VISITAS_CONFIG: VisitasConfig = {
  diasSemana: [2, 3, 4, 5, 6],
  horaInicio: "09:00",
  horaFim: "17:00",
  duracaoMinutos: 60,
  antecedenciaMinimaHoras: 12,
  // Um ano: muita gente marca a festa do fim do ano com meses de antecedência.
  diasFrente: 365,
  excluirDiasOcupados: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRecord(value: any): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Lê uma configuração pela chave, com fallback seguro se a linha não
 * existir (setting nunca salva) ou se o valor salvo vier incompleto —
 * mescla raso com o fallback quando os dois são objetos, para uma setting
 * nova (ex.: um novo modelo de WhatsApp) não sumir por causa de um valor
 * salvo antigo e incompleto.
 */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const rows = await sql`select value from settings where key = ${key}`;
    const value = rows[0]?.value;
    if (value === undefined || value === null) return fallback;
    if (isRecord(value) && isRecord(fallback)) {
      return { ...fallback, ...value } as T;
    }
    return value as T;
  } catch (err) {
    console.error(`getSetting(${key}) falhou, usando padrão:`, err);
    return fallback;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await sql`
    insert into settings (key, value, updated_at)
    values (${key}, ${JSON.stringify(value)}::jsonb, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}
