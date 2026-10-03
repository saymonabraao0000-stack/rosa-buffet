import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarCheck,
  Kanban,
  BarChart3,
  MessageSquareQuote,
  Images,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { requireSession } from "@/lib/crm/require-session";
import { getInicioResumo, type InicioItem } from "@/lib/crm/inicio";
import { getThemeLabel } from "@/lib/quiz-data";

export const dynamic = "force-dynamic";

// Tela de entrada do CRM: cada área vira um "aplicativo" (protótipo aprovado
// em Planos/prototipo-crm-apps.html). Dentro das áreas, a barra do topo tem
// "Início" para voltar aqui.
const APPS: { href: string; nome: string; icon: LucideIcon; selo?: "leads" | "visitas" | "depoimentos" }[] = [
  { href: "/crm/dashboard", nome: "Dashboard", icon: LayoutDashboard },
  { href: "/crm/leads", nome: "Leads", icon: Users, selo: "leads" },
  { href: "/crm/agenda", nome: "Agenda", icon: Calendar },
  { href: "/crm/visitas", nome: "Visitas", icon: CalendarCheck, selo: "visitas" },
  { href: "/crm/funil", nome: "Funil", icon: Kanban },
  { href: "/crm/relatorio", nome: "Relatório", icon: BarChart3 },
  { href: "/crm/depoimentos", nome: "Depoimentos", icon: MessageSquareQuote, selo: "depoimentos" },
  { href: "/crm/fotos", nome: "Fotos das festas", icon: Images },
  { href: "/crm/configuracoes", nome: "Configurações", icon: Settings },
];

function saudacao() {
  const agora = new Date();
  const hora = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Manaus", hour: "numeric", hourCycle: "h23" }).format(agora),
  );
  const data = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Manaus",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(agora);
  return {
    titulo: hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite",
    data: data.charAt(0).toUpperCase() + data.slice(1),
  };
}

function itemHoje(item: InicioItem) {
  if (item.tipo === "festa")
    return { href: `/crm/leads/${item.id}`, texto: `Festa · ${item.nome}`, detalhe: getThemeLabel(item.temaSlug) ?? "" };
  if (item.tipo === "visita")
    return { href: "/crm/visitas", texto: `Visita ao salão · ${item.nome}`, detalhe: item.hora };
  return { href: `/crm/leads/${item.id}`, texto: `Retornar para ${item.nome}`, detalhe: "retorno" };
}

export default async function CrmInicioPage() {
  await requireSession();
  const resumo = await getInicioResumo();
  const { titulo, data } = saudacao();
  const selos = { leads: resumo.leadsNovos, visitas: resumo.visitasHoje, depoimentos: resumo.depoimentosParaAprovar };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Degradê dourado dos ícones, no tom da logo. userSpaceOnUse porque as
          linhas retas dos ícones têm caixa de largura zero. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="ouro-app" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22">
            <stop offset="0" stopColor="#f3dc8a" />
            <stop offset=".5" stopColor="#d4af37" />
            <stop offset="1" stopColor="#a8841c" />
          </linearGradient>
        </defs>
      </svg>

      <header className="lg:text-center">
        <h1 className="font-display text-3xl text-cream lg:text-4xl">{titulo}</h1>
        <p className="mt-1 text-sm text-cream/60">{data}</p>
      </header>

      <div className="mt-8 lg:mt-12 lg:grid lg:grid-cols-[auto_320px] lg:items-start lg:justify-center lg:gap-14">
        <nav aria-label="Áreas do CRM" className="grid grid-cols-3 gap-x-2.5 gap-y-6 lg:gap-x-9 lg:gap-y-8">
          {APPS.map((app) => {
            const Icon = app.icon;
            const selo = app.selo ? selos[app.selo] : 0;
            return (
              <Link
                key={app.href}
                href={app.href}
                className="focus-gold group flex flex-col items-center gap-2.5 rounded-3xl py-1 transition-transform duration-100 active:scale-95"
              >
                <span className="relative grid h-[74px] w-[74px] place-items-center rounded-[22px] bg-[radial-gradient(120%_90%_at_30%_10%,#2a2620_0%,#121212_60%,#0a0a0a_100%)] shadow-[inset_0_0_0_1px_rgba(201,162,39,.35),inset_0_1px_0_rgba(255,240,200,.08),0_8px_18px_-8px_rgba(0,0,0,.7)] transition-shadow group-hover:shadow-[inset_0_0_0_1px_rgba(224,195,104,.8),inset_0_1px_0_rgba(255,240,200,.12),0_10px_24px_-8px_rgba(201,162,39,.35)] lg:h-[92px] lg:w-[92px] lg:rounded-[26px]">
                  <Icon color="url(#ouro-app)" strokeWidth={1.6} className="h-[34px] w-[34px] lg:h-[42px] lg:w-[42px]" aria-hidden="true" />
                  {selo > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-gold px-1.5 text-xs font-semibold text-ink shadow-[0_0_0_3px_var(--color-ink-soft)]">
                      {selo}
                    </span>
                  )}
                </span>
                <span className="text-center text-[12.5px] font-medium leading-tight text-cream lg:text-sm">{app.nome}</span>
              </Link>
            );
          })}
        </nav>

        <section className="mt-8 rounded-2xl border border-cream/10 bg-ink lg:mt-0">
          <h2 className="px-4 pt-3.5 pb-1 text-xs font-semibold uppercase tracking-widest text-gold">Pra hoje</h2>
          <ul>
            {resumo.hoje.map((item) => {
              const { href, texto, detalhe } = itemHoje(item);
              return (
                <li key={`${item.tipo}-${item.id}`} className="border-t border-cream/10 first:border-t-0">
                  <Link
                    href={href}
                    className="focus-gold flex justify-between gap-3 px-4 py-3 text-sm text-cream transition-colors hover:text-gold"
                  >
                    <span>{texto}</span>
                    <span className="shrink-0 text-cream/60">{detalhe}</span>
                  </Link>
                </li>
              );
            })}
            {resumo.retornosAtrasados > 0 && (
              <li className="border-t border-cream/10 first:border-t-0">
                <Link
                  href="/crm/leads?retorno=atrasados"
                  className="focus-gold flex justify-between gap-3 px-4 py-3 text-sm text-amber-300/90 transition-colors hover:text-gold"
                >
                  <span>
                    {resumo.retornosAtrasados} retorno{resumo.retornosAtrasados === 1 ? "" : "s"} atrasado
                    {resumo.retornosAtrasados === 1 ? "" : "s"}
                  </span>
                  <span className="shrink-0">ver</span>
                </Link>
              </li>
            )}
            {resumo.hoje.length === 0 && resumo.retornosAtrasados === 0 && (
              <li className="px-4 py-3 text-sm text-cream/60">Nada marcado pra hoje.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
