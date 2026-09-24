-- Schema do CRM da Rosa Buffet.
--
-- Não há ferramenta de migração no projeto (banco pequeno, muda pouco) — este
-- arquivo é a fonte da verdade e deve ser aplicado colando no SQL Editor do
-- Neon (Vercel → projeto rosa-buffet → Storage → Neon → "Open in Neon
-- Console" → SQL Editor) ou rodando `node --env-file=.env.local db/apply.mjs`.

-- leads: um registro por cliente em potencial, criado pelo quiz (/orcamento,
-- salvo progressivamente conforme a pessoa responde) ou manualmente pela
-- equipe (lead que chegou por telefone/Instagram).
create table if not exists leads (
  id                uuid primary key default gen_random_uuid(),

  -- contato
  nome              text not null,
  telefone          text not null,

  -- origem e funil
  source            text not null default 'quiz'
                     check (source in ('quiz', 'manual')),
  status            text not null default 'novo'
                     check (status in ('novo', 'contatado', 'orcamento_enviado', 'fechado', 'perdido')),
  perdido_motivo    text,

  -- respostas do quiz (tudo opcional: preenchido aos poucos, pode ficar
  -- incompleto se a pessoa abandonar o quiz no meio)
  tema_slug         text,
  guest_range_slug  text,
  estimated_guests  integer,
  data_evento       date,
  data_skipped      boolean not null default false,
  buffet_tier_slug  text,
  addon_slugs       text[] not null default '{}',
  estimate_min      integer,
  estimate_max      integer,

  -- até onde a pessoa chegou no quiz (visibilidade de abandono)
  current_step      text,

  -- reserva de data confirmada
  sinal_pago        boolean not null default false,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists leads_status_idx on leads (status);
create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_data_evento_idx on leads (data_evento)
  where data_evento is not null;

-- lead_notes: anotações manuais e datadas, adicionadas no CRM. Sem coluna de
-- autor: o CRM tem uma senha única compartilhada, não contas por pessoa.
create table if not exists lead_notes (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads (id) on delete cascade,
  text        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists lead_notes_lead_id_idx on lead_notes (lead_id);

-- ============================================================================
-- Fase 1 do plano de melhorias do CRM (2026-09-24) — só aditivo, ver
-- Planos/crm-melhorias-2026-09-24.md. Nunca dropar/alterar coluna ou
-- constraint existente acima desta linha.
-- ============================================================================

-- leads: colunas novas, todas opcionais.
alter table leads add column if not exists retornar_em date;
alter table leads add column if not exists origem text;
alter table leads add column if not exists valor_fechado integer;
alter table leads add column if not exists valor_sinal integer;
alter table leads add column if not exists valor_pago integer default 0;
alter table leads add column if not exists pagamento_final_em date;
alter table leads add column if not exists checklist jsonb not null default '{}';
alter table leads add column if not exists recompra_avisada_em timestamptz;
alter table leads add column if not exists google_event_id text;

create index if not exists leads_retornar_em_idx on leads (retornar_em)
  where retornar_em is not null;
create index if not exists leads_origem_idx on leads (origem)
  where origem is not null;

-- settings: configurações editáveis do CRM (preços, condições de pagamento,
-- link de avaliação, modelos de WhatsApp, tokens do Google Agenda). Leitura
-- sempre com fallback para os padrões definidos no código (settings.ts).
create table if not exists settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- blocked_dates: datas bloqueadas manualmente pela equipe (fora de evento
-- fechado) — entram junto com getBookedDates() para o simulador.
create table if not exists blocked_dates (
  data        date primary key,
  motivo      text,
  created_at  timestamptz not null default now()
);

-- waitlist: lista de espera para datas já ocupadas.
create table if not exists waitlist (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads (id) on delete set null,
  nome        text not null,
  telefone    text not null,
  data        date not null,
  created_at  timestamptz not null default now(),
  avisado_em  timestamptz
);

create index if not exists waitlist_data_idx on waitlist (data);

-- testimonials: depoimentos pedidos a clientes de festas fechadas, com
-- aprovação manual antes de aparecer no site.
create table if not exists testimonials (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid references leads (id) on delete set null,
  token         text not null unique,
  nome          text,
  texto         text,
  nota          integer,
  status        text not null default 'pendente'
                check (status in ('pendente', 'aprovado', 'recusado')),
  created_at    timestamptz not null default now(),
  respondido_em timestamptz
);

create index if not exists testimonials_status_idx on testimonials (status);

-- login_attempts: trava de login por IP (5 erros em 15 min → bloqueia 15 min).
create table if not exists login_attempts (
  ip          text not null,
  created_at  timestamptz not null default now()
);

create index if not exists login_attempts_ip_created_at_idx on login_attempts (ip, created_at);

-- ============================================================================
-- Prints de avaliações (2026-09-24) — carrossel de depoimentos ganha prints
-- enviados pelo CRM, além dos estáticos e dos escritos. Só aditivo.
-- ============================================================================

-- review_prints: capturas de tela de avaliações enviadas pela equipe pelo
-- CRM (/crm/depoimentos), redimensionadas no navegador antes do upload. Os
-- bytes ficam no próprio Postgres (bytea) — não há storage de arquivos no
-- projeto e o volume é pequeno (imagens já comprimidas para no máx. 600 KB).
create table if not exists review_prints (
  id          uuid primary key default gen_random_uuid(),
  data        bytea not null,
  mime        text not null,
  width       integer not null,
  height      integer not null,
  legenda     text,
  visivel     boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists review_prints_visivel_created_at_idx
  on review_prints (visivel, created_at desc);

-- ============================================================================
-- Fotos das festas (2026-09-24) — portfólio de /celebracoes ganha fotos
-- enviadas pela equipe pelo CRM (/crm/fotos), além das estáticas em
-- public/images/portfolio. Só aditivo.
-- ============================================================================

-- party_photos: fotos de festas realizadas, enviadas pela equipe, com tema
-- (mesmos slugs de portfolio-data.ts) e visibilidade no site. Os bytes ficam
-- no próprio Postgres (bytea) — mesmo padrão de review_prints — redimensionadas
-- no navegador antes do upload para no máx. 900 KB.
create table if not exists party_photos (
  id          uuid primary key default gen_random_uuid(),
  tema        text not null,
  data        bytea not null,
  mime        text not null,
  width       integer not null,
  height      integer not null,
  legenda     text,
  visivel     boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists party_photos_tema_visivel_created_at_idx
  on party_photos (tema, visivel, created_at desc);

-- Alerta de lead sem resposta (2026-09-24): marca quando o celular já foi
-- avisado de que o lead do simulador continua "novo" depois de 1 hora, para
-- avisar uma vez só.
alter table leads add column if not exists alerta_sem_resposta_em timestamptz;
