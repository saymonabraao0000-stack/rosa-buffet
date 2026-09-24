import { NextResponse } from "next/server";
import { getVisitaById } from "@/lib/visitas";
import { siteConfig } from "@/lib/site-config";

// Rota pública (sem sessão) que gera um .ics só com os dados da própria
// visita — nunca o telefone. O id da visita é um uuid não adivinhável
// (gen_random_uuid()), então não precisa de token extra.
export const dynamic = "force-dynamic";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Formato "AAAAMMDDTHHMMSS" em horário local de Manaus (UTC-4, sem DST),
// gravado como hora "flutuante" (sem sufixo Z) — evita conversão de fuso ao
// importar no calendário do celular.
function toIcsLocal(data: string, hora: string): string {
  const [y, m, d] = data.split("-");
  const [h, min] = hora.split(":");
  return `${y}${m}${d}T${h}${min}00`;
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const visita = await getVisitaById(id);
  if (!visita) return new NextResponse("Visita não encontrada", { status: 404 });

  const [hh, mm] = visita.hora.split(":").map(Number);
  const fimMin = hh * 60 + mm + 60;
  const horaFim = `${pad(Math.floor(fimMin / 60))}:${pad(fimMin % 60)}`;

  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(
    now.getUTCHours(),
  )}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rosa Buffet//Visita ao salao//PT",
    "CALSCALE:GREGORIAN",
    "BEGIN:VTIMEZONE",
    "TZID:America/Manaus",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0400",
    "TZNAME:-04",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:visita-${visita.id}@rosabuffeteventos.com.br`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=America/Manaus:${toIcsLocal(visita.data, visita.hora)}`,
    `DTEND;TZID=America/Manaus:${toIcsLocal(visita.data, horaFim)}`,
    `SUMMARY:${icsEscape("Visita ao salão - Rosa Buffet")}`,
    `LOCATION:${icsEscape(siteConfig.address.full)}`,
    `DESCRIPTION:${icsEscape("Visita ao salão da Rosa Buffet. " + siteConfig.phoneDisplay)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="visita-rosa-buffet.ics"`,
    },
  });
}
