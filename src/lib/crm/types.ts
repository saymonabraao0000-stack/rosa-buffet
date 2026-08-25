export type LeadStatus = "novo" | "contatado" | "orcamento_enviado" | "fechado" | "perdido";
export type LeadSource = "quiz" | "manual";

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
}>;

export type ManualLeadInput = {
  nome: string;
  telefone: string;
  temaSlug: string | null;
  guestRangeSlug: string | null;
  dataEvento: string | null;
  buffetTierSlug: string | null;
  status: LeadStatus;
};

export type DashboardStats = {
  leadsEsteMes: number;
  porStatus: Record<LeadStatus, number>;
  taxaConversao: number; // fechados / total, 0-1
  proximosEventos: { id: string; nome: string; dataEvento: string }[];
};
