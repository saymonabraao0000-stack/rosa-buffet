import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionCookieValue } from "@/lib/crm/session";
import { getLeadById } from "@/lib/crm/leads";
import {
  DEFAULT_CONDICOES_PAGAMENTO,
  getDefaultPrecos,
  getSetting,
  type PrecosSetting,
} from "@/lib/crm/settings";
import { getGuestLabel, getThemeLabel, guestOptions, partyPackages } from "@/lib/quiz-data";
import { manausTodayISO, addDaysISO } from "@/lib/crm/manaus-date";
import { siteConfig } from "@/lib/site-config";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

// Item 10 — orçamento em PDF, gerado sob demanda (não fica salvo em lugar
// nenhum). Rota fora do route group (protected) de propósito, mesmo padrão
// de `src/app/crm/leads/exportar.csv/route.ts`: Route Handlers não passam
// pelo layout do CRM, então a sessão é checada aqui mesmo.

export const dynamic = "force-dynamic";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

const COLOR_INK = rgb(0x0d / 255, 0x0d / 255, 0x0d / 255);
const COLOR_GOLD = rgb(0xc9 / 255, 0xa2 / 255, 0x27 / 255);
const COLOR_CREAM = rgb(0xfa / 255, 0xf8 / 255, 0xf3 / 255);
const COLOR_GRAY = rgb(0.42, 0.42, 0.42);
const COLOR_DIVIDER = rgb(0.85, 0.85, 0.85);

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function formatDateBR(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

// StandardFonts.Helvetica do pdf-lib usa WinAnsiEncoding (cp1252), que já
// cobre todos os acentos do português (á é í ó ú â ê ô ã õ ç À). O que NÃO
// existe nessa tabela são certos símbolos "espertos" (travessão longo, aspas
// curvas, reticências tipográficas, emoji) — trocamos por equivalentes ASCII
// simples antes de desenhar, para nunca quebrar o PDF por causa de um
// caractere fora da fonte.
function sanitizeForWinAnsi(text: string): string {
  return text
    .replace(/[–—]/g, "-") // en dash, em dash
    .replace(/[‘’]/g, "'") // aspas simples curvas
    .replace(/[“”]/g, '"') // aspas duplas curvas
    .replace(/…/g, "...") // reticências tipográficas
    .replace(/•/g, "-") // bullet
    .replace(/[^\x00-\xFF]/g, ""); // qualquer outra coisa fora do Latin-1 (emoji etc.)
}

function slugifyFilename(name: string): string {
  const normalized = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return normalized || "cliente";
}

type DrawTextOptions = {
  font: PDFFont;
  size: number;
  color?: ReturnType<typeof rgb>;
  align?: "left" | "right";
  pageWidth?: number;
  x?: number;
};

function drawText(page: PDFPage, text: string, y: number, opts: DrawTextOptions): void {
  const clean = sanitizeForWinAnsi(text);
  const { font, size, color = COLOR_INK, align = "left" } = opts;
  let x = opts.x ?? 40;
  if (align === "right") {
    const width = font.widthOfTextAtSize(clean, size);
    x = (opts.pageWidth ?? A4_WIDTH) - 40 - width;
  }
  page.drawText(clean, { x, y, size, font, color });
}

// Quebra um texto em várias linhas para caber em `maxWidth`, sem cortar
// palavras no meio — usado nos itens inclusos do pacote e nas condições de
// pagamento, que podem ser mais longos que a largura da página.
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const clean = sanitizeForWinAnsi(text);
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const jar = await cookies();
  if (!isValidSessionCookieValue(jar.get(SESSION_COOKIE_NAME)?.value)) {
    return new Response("Não autorizado.", { status: 401 });
  }

  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) {
    return new Response("Lead não encontrado.", { status: 404 });
  }

  const [precos, condicoesPagamento] = await Promise.all([
    getSetting<PrecosSetting>("precos", getDefaultPrecos()),
    getSetting("condicoes_pagamento", DEFAULT_CONDICOES_PAGAMENTO),
  ]);

  const pacote = lead.buffetTierSlug
    ? partyPackages.find((p) => p.slug === lead.buffetTierSlug)
    : undefined;
  const guestOption = lead.guestRangeSlug
    ? guestOptions.find((g) => g.slug === lead.guestRangeSlug)
    : undefined;
  const guests = guestOption ? guestOption.guests : lead.estimatedGuests;

  // Ordem de prioridade do valor: fechado com o cliente > preço do pacote na
  // faixa de convidados (setting `precos`, com fallback para quiz-data.ts) >
  // "sob consulta".
  let valor: number | null = lead.valorFechado ?? null;
  if (valor == null && pacote && guests != null) {
    valor = precos[pacote.slug]?.pricesByGuests[guests] ?? pacote.pricesByGuests[guests] ?? null;
  }

  const nota = pacote ? precos[pacote.slug]?.note ?? pacote.note : undefined;

  const emitidoEm = manausTodayISO();
  const validoAte = addDaysISO(emitidoEm, 15);

  const doc = await PDFDocument.create();
  doc.setTitle(`Orçamento - ${lead.nome}`);
  doc.setProducer("Rosa Buffet CRM");

  const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Faixa dourada no topo com o logo (PNG com transparência) sobre fundo
  // escuro, e o título à direita.
  const bannerHeight = 110;
  page.drawRectangle({
    x: 0,
    y: A4_HEIGHT - bannerHeight,
    width: A4_WIDTH,
    height: bannerHeight,
    color: COLOR_INK,
  });

  try {
    const logoRes = await fetch(new URL("/images/logo-header.png", request.url));
    if (logoRes.ok) {
      const logoBytes = await logoRes.arrayBuffer();
      const logoImage = await doc.embedPng(logoBytes);
      const logoHeight = 38;
      const logoWidth = (logoImage.width / logoImage.height) * logoHeight;
      page.drawImage(logoImage, {
        x: 40,
        y: A4_HEIGHT - bannerHeight / 2 - logoHeight / 2,
        width: logoWidth,
        height: logoHeight,
      });
    }
  } catch (err) {
    console.error("orcamento PDF: falha ao carregar logo, seguindo sem ela:", err);
  }

  drawText(page, "ORÇAMENTO", A4_HEIGHT - 50, {
    font: fontBold,
    size: 24,
    color: COLOR_GOLD,
    align: "right",
  });
  drawText(page, siteConfig.fullName, A4_HEIGHT - 70, {
    font: fontRegular,
    size: 10,
    color: COLOR_CREAM,
    align: "right",
  });

  let y = A4_HEIGHT - bannerHeight - 40;

  drawText(page, `Emitido em: ${formatDateBR(emitidoEm)}`, y, {
    font: fontRegular,
    size: 10,
    color: COLOR_GRAY,
  });
  drawText(page, `Válido até: ${formatDateBR(validoAte)}`, y, {
    font: fontRegular,
    size: 10,
    color: COLOR_GRAY,
    align: "right",
  });

  y -= 30;

  function sectionTitle(title: string) {
    drawText(page, title, y, { font: fontBold, size: 13, color: COLOR_INK });
    y -= 8;
    page.drawLine({
      start: { x: 40, y },
      end: { x: A4_WIDTH - 40, y },
      thickness: 0.75,
      color: COLOR_DIVIDER,
    });
    y -= 20;
  }

  function fieldLine(label: string, value: string) {
    drawText(page, label, y, { font: fontBold, size: 10.5, color: COLOR_INK });
    drawText(page, value, y, {
      font: fontRegular,
      size: 10.5,
      color: COLOR_GRAY,
      align: "right",
    });
    y -= 20;
  }

  // Dados do cliente
  sectionTitle("Cliente");
  fieldLine("Nome", lead.nome);
  fieldLine("Telefone", lead.telefone);
  y -= 8;

  // Festa
  sectionTitle("Festa");
  fieldLine("Tema", getThemeLabel(lead.temaSlug) ?? "A definir");
  fieldLine("Data", lead.dataEvento ? formatDateBR(lead.dataEvento) : "A definir");
  fieldLine(
    "Convidados",
    getGuestLabel(lead.guestRangeSlug) ??
      (lead.estimatedGuests ? `${lead.estimatedGuests} convidados` : "A definir"),
  );
  y -= 8;

  // Pacote
  sectionTitle("Pacote");
  if (pacote) {
    drawText(page, pacote.label, y, { font: fontBold, size: 12, color: COLOR_INK });
    y -= 16;
    drawText(page, pacote.tagline, y, { font: fontRegular, size: 10, color: COLOR_GRAY });
    y -= 18;

    for (const highlight of pacote.highlights) {
      const lines = wrapText(`- ${highlight}`, fontRegular, 10, A4_WIDTH - 80);
      for (const line of lines) {
        drawText(page, line, y, { font: fontRegular, size: 10, color: COLOR_INK });
        y -= 15;
      }
    }

    if (nota) {
      y -= 4;
      const notaLines = wrapText(nota, fontRegular, 9, A4_WIDTH - 80);
      for (const line of notaLines) {
        drawText(page, line, y, { font: fontRegular, size: 9, color: COLOR_GRAY });
        y -= 13;
      }
    }
  } else {
    drawText(page, "A definir", y, { font: fontRegular, size: 10.5, color: COLOR_GRAY });
    y -= 15;
  }
  y -= 12;

  // Valor
  sectionTitle("Valor");
  const valorTexto = valor != null ? currency.format(valor) : "Sob consulta";
  drawText(page, valorTexto, y, { font: fontBold, size: 20, color: COLOR_GOLD });
  y -= 30;
  if (lead.valorFechado == null && pacote) {
    drawText(
      page,
      "Valor sujeito a confirmação com a nossa equipe.",
      y,
      { font: fontRegular, size: 9, color: COLOR_GRAY },
    );
    y -= 20;
  }
  y -= 8;

  // Condições de pagamento
  sectionTitle("Condições de pagamento");
  const condicoesLines = wrapText(
    condicoesPagamento || DEFAULT_CONDICOES_PAGAMENTO,
    fontRegular,
    10.5,
    A4_WIDTH - 80,
  );
  for (const line of condicoesLines) {
    drawText(page, line, y, { font: fontRegular, size: 10.5, color: COLOR_INK });
    y -= 16;
  }

  // Rodapé
  const footerY = 60;
  page.drawLine({
    start: { x: 40, y: footerY + 20 },
    end: { x: A4_WIDTH - 40, y: footerY + 20 },
    thickness: 0.75,
    color: COLOR_DIVIDER,
  });
  drawText(
    page,
    `${siteConfig.fullName} - ${siteConfig.phoneDisplay} - ${siteConfig.social.instagram.replace("https://www.instagram.com/", "@").replace(/\/$/, "")} - ${siteConfig.url.replace("https://", "")}`,
    footerY,
    { font: fontRegular, size: 8.5, color: COLOR_GRAY },
  );

  const pdfBytes = await doc.save();
  const filename = `orcamento-${slugifyFilename(lead.nome)}.pdf`;

  return new Response(new Uint8Array(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
