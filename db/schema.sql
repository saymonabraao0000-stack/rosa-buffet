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
