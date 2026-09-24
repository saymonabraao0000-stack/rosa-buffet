export type LeadStatus = "novo" | "contatado" | "orcamento_enviado" | "fechado" | "perdido";
export type LeadSource = "quiz" | "manual";

/** De onde o lead veio — não confundir com `LeadSource` (quiz/manual, que é técnico). */
export type LeadOrigem =
  | "site"
  | "instagram"
  | "indicacao"
  | "google"
  | "whatsapp"
  | "passou_na_frente"
  | "outro";

/** Rótulos em português de `LeadOrigem`, para selects e exibição na ficha/dashboard. */
export const LEAD_ORIGENS: Record<LeadOrigem, string> = {
  site: "Site (simulador)",
  instagram: "Instagram",
  indicacao: "Indicação",
  google: "Google",
  whatsapp: "WhatsApp",
  passou_na_frente: "Passou na frente",
  outro: "Outro",
};

/** Checklist da festa (item 15 do plano) — chaves fixas, todas opcionais. */
export type LeadChecklist = Partial<{
  cardapioDefinido: boolean;
  bolo: boolean;
  decoracao: boolean;
  numeroFinalConvidados: number;
  horario: string;
  degustacaoEm: string; // "AAAA-MM-DD"
  fornecedores: string;
  observacoes: string;
}>;

export type Lead = {
  id: string;
  nome: string;
  telefone: string;
  source: LeadSource;
  status: LeadStatus;
  perdidoMotivo: string | null;
  temaSlug: string | null;
  guestRangeSlug: string | null;
  estimatedGuests: number | null;
  dataEvento: string | null; // "AAAA-MM-DD"
  dataSkipped: boolean;
  buffetTierSlug: string | null;
  addonSlugs: string[];
  estimateMin: number | null;
  estimateMax: number | null;
  currentStep: string | null;
  sinalPago: boolean;
  createdAt: string;
  updatedAt: string;
  // Fase 1 (2026-09-24)
  retornarEm: string | null; // "AAAA-MM-DD"
  origem: LeadOrigem | null;
  valorFechado: number | null;
  valorSinal: number | null;
  valorPago: number;
  pagamentoFinalEm: string | null; // "AAAA-MM-DD"
  checklist: LeadChecklist;
  recompraAvisadaEm: string | null;
  googleEventId: string | null;
};

export type LeadNote = {
  id: string;
  leadId: string;
  text: string;
  createdAt: string;
};

/** Campos que o quiz vai preenchendo aos poucos, conforme a pessoa responde. */
export type LeadProgressPatch = Partial<{
  temaSlug: string;
  guestRangeSlug: string;
  estimatedGuests: number;
  dataEvento: string | null;
  dataSkipped: boolean;
  buffetTierSlug: string;
  addonSlugs: string[];
  estimateMin: number;
  estimateMax: number;
  currentStep: string;
}>;

export type LeadFilters = Partial<{
  status: LeadStatus;
  temaSlug: string;
  dateFrom: string;
  dateTo: string;
  q: string;
  /** Só leads do simulador que pararam antes do orçamento. */
  incompleto: boolean;
  /** Item 1: filtro de retorno na lista de leads. */
  retorno: "hoje" | "atrasados";
}>;

/** Dados do lead editáveis no CRM (cadastro manual e tela de edição). */
export type LeadDetailsInput = {
  nome: string;
  telefone: string;
  temaSlug: string | null;
  guestRangeSlug: string | null;
  dataEvento: string | null;
  buffetTierSlug: string | null;
  origem: LeadOrigem | null;
};

export type ManualLeadInput = LeadDetailsInput & {
  status: LeadStatus;
};

/** Financeiro da festa (item 4) — só relevante para leads fechados. */
export type LeadFinanceiroInput = {
  valorFechado: number | null;
  valorSinal: number | null;
  valorPago: number;
  pagamentoFinalEm: string | null;
};

export type DashboardStats = {
  leadsEsteMes: number;
  porStatus: Record<LeadStatus, number>;
  taxaConversao: number; // fechados / total, 0-1
  proximosEventos: { id: string; nome: string; dataEvento: string }[];
  // Fase 2 (2026-09-24)
  retornosHoje: { id: string; nome: string; retornarEm: string }[];
  retornosAtrasados: { id: string; nome: string; retornarEm: string }[];
  porOrigem: { origem: LeadOrigem | null; total: number; fechados: number }[];
  faturamentoMes: number;
  aReceber: number;
  proximasFestas: {
    id: string;
    nome: string;
    dataEvento: string;
    checklistProntos: number;
  }[];
};
