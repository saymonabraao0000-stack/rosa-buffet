/**
 * Lembra de onde o visitante chegou ao site (primeiro contato, por 30 dias),
 * para o lead do simulador e da visita cair no CRM com a origem certa mesmo
 * que a pessoa entre pela home e só depois abra o /orcamento.
 *
 * Ordem: ?origem= na URL (links da bio, perfil do Google) > referrer
 * (google.* → "google", instagram → "instagram"). O servidor valida de novo
 * contra LEAD_ORIGENS, então um valor estranho aqui vira "site".
 */
const CHAVE = "rb_origem";
const VALIDADE_MS = 30 * 24 * 60 * 60 * 1000;
const CONHECIDAS = ["site", "instagram", "indicacao", "google", "whatsapp", "passou_na_frente", "outro"];

function origemDoReferrer(referrer: string): string | null {
  if (!referrer) return null;
  let host: string;
  try {
    host = new URL(referrer).hostname;
  } catch {
    return null;
  }
  if (host === window.location.hostname) return null;
  if (/(^|\.)google\.[a-z.]+$/.test(host)) return "google";
  if (/(^|\.)instagram\.com$/.test(host)) return "instagram";
  return null;
}

/** Chamado uma vez por carregamento de página (OrigemTracker, no layout raiz). */
export function registrarOrigem() {
  try {
    const daUrl = new URLSearchParams(window.location.search).get("origem");
    const origem = daUrl && CONHECIDAS.includes(daUrl) ? daUrl : origemDoReferrer(document.referrer);
    if (!origem) return;
    const atual = lerOrigemSalva();
    // Primeiro contato vence: não sobrescreve uma origem ainda válida.
    if (atual) return;
    localStorage.setItem(CHAVE, JSON.stringify({ origem, em: Date.now() }));
  } catch {
    // localStorage bloqueado (aba anônima etc.): segue sem origem.
  }
}

export function lerOrigemSalva(): string | undefined {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return undefined;
    const { origem, em } = JSON.parse(bruto) as { origem?: string; em?: number };
    if (!origem || !em || Date.now() - em > VALIDADE_MS) {
      localStorage.removeItem(CHAVE);
      return undefined;
    }
    return origem;
  } catch {
    return undefined;
  }
}
