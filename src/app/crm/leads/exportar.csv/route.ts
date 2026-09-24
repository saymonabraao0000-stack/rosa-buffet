import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionCookieValue } from "@/lib/crm/session";
import { listLeads } from "@/lib/crm/leads";
import { LEAD_ORIGENS } from "@/lib/crm/types";
import type { Lead, LeadFilters, LeadStatus } from "@/lib/crm/types";
import { getGuestLabel, getPartyPackageLabel, getThemeLabel } from "@/lib/quiz-data";
import { isQuizIncomplete, quizStepLabel } from "@/lib/crm/quiz-progress";
import { manausTodayISO } from "@/lib/crm/manaus-date";

// Item 18 — exportar a lista de leads em CSV, respeitando os mesmos filtros
// da tela `/crm/leads`. Rota fora do route group (protected) de propósito:
// Route Handlers não passam pelo layout, então a sessão é checada aqui
// mesmo, direto com `isValidSessionCookieValue` (mesma checagem de
// `requireSession`, só que devolvendo 401 em vez de redirecionar).

const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  orcamento_enviado: "Orçamento enviado",
  fechado: "Fechado",
  perdido: "Perdido",
};

const CSV_COLUMNS = [
  "Nome",
  "Telefone",
  "Origem",
  "Status",
  "Tema",
  "Convidados",
  "Data da festa",
  "Pacote",
  "Valor fechado",
  "Já pago",
  "Retornar em",
  "Andamento no simulador",
  "Criado em",
];

function formatDateBR(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

// Aspas em campos com `;`, `"` ou quebra de linha — separador do CSV é `;`.
function csvField(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (/[;"\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function leadToRow(lead: Lead): string[] {
  return [
    lead.nome,
    lead.telefone,
    lead.origem ? LEAD_ORIGENS[lead.origem] : "",
    STATUS_LABELS[lead.status],
    getThemeLabel(lead.temaSlug) ?? "",
    getGuestLabel(lead.guestRangeSlug) ?? "",
    formatDateBR(lead.dataEvento),
    getPartyPackageLabel(lead.buffetTierSlug) ?? "",
    lead.valorFechado != null ? String(lead.valorFechado) : "",
    lead.valorPago != null ? String(lead.valorPago) : "",
    formatDateBR(lead.retornarEm),
    isQuizIncomplete(lead) ? (quizStepLabel(lead) ?? "") : "",
    formatDateBR(lead.createdAt),
  ];
}

function buildCsv(leadsList: Lead[]): string {
  const lines = [CSV_COLUMNS.join(";")];
  for (const lead of leadsList) {
    lines.push(leadToRow(lead).map(csvField).join(";"));
  }
  // BOM no início: sem ele o Excel no Windows lê UTF-8 com acento errado.
  return "﻿" + lines.join("\r\n") + "\r\n";
}

export async function GET(request: Request): Promise<Response> {
  const jar = await cookies();
  if (!isValidSessionCookieValue(jar.get(SESSION_COOKIE_NAME)?.value)) {
    return new Response("Não autorizado.", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filters: LeadFilters = {
    status: (searchParams.get("status") as LeadStatus) || undefined,
    temaSlug: searchParams.get("tema") || undefined,
    dateFrom: searchParams.get("from") || undefined,
    dateTo: searchParams.get("to") || undefined,
    q: searchParams.get("q") || undefined,
    incompleto: searchParams.get("incompleto") === "1" || undefined,
    retorno: (searchParams.get("retorno") as "hoje" | "atrasados") || undefined,
  };

  const leadsList = await listLeads(filters);
  const csv = buildCsv(leadsList);
  const filename = `leads-rosa-buffet-${manausTodayISO()}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
