# Plano — melhorias do CRM da Rosa Buffet (noite de 23→24/09/2026)

Briefing único para os agentes que implementam. Leia também o `CLAUDE.md` da raiz do
projeto (stack, backend, convenções). Tudo em português do Brasil (UI, comentários, commits).

## Decisões do Saymon (tomadas antes de dormir)

| Tema | Decisão |
|---|---|
| Publicação | **Direto em produção**: cada fase testada vai para a branch `cloudflare` (push = deploy na Cloudflare, rosabuffeteventos.com.br). Por isso: nada vai pro ar sem `tsc` + `eslint` + `next build` + teste no workerd local. |
| Banco | Pode alterar o banco de produção **só adicionando** (tabelas novas, `alter table … add column if not exists`). Nunca `drop`, nunca alterar/remover coluna ou constraint existente, nunca apagar dados reais. |
| Login por pessoa (17) | **Fica pra depois.** Mantém a senha única. |
| Google Agenda (14) | **Integração completa** (OAuth). Código pronto e dormente até existirem `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`; ativação guiada de manhã. |
| Condições de pagamento (PDF) | Editável em Configurações. Padrão: "Sinal de R$ 500 na reserva da data; restante até 7 dias antes da festa." |
| Link de avaliação no Google | Editável em Configurações, começa vazio. Vazio → mensagem pós-festa pede só depoimento. |
| Resumo diário | 8h de Manaus (America/Manaus, UTC−4 → cron `0 12 * * *`). |
| Festa do ano que vem | Lembrar 2 meses antes do aniversário da festa (≈10 meses depois dela). |

## Convenções obrigatórias

- **Banco**: `db/schema.sql` continua sendo a fonte da verdade. Toda mudança nova vai no FIM do arquivo, idempotente
  (`create table if not exists`, `alter table leads add column if not exists …`, `create index if not exists`).
  Aplicar com `node --env-file=.env.local db/apply.mjs` (o `.env.local` aponta para o banco de PRODUÇÃO — por isso só aditivo).
- Toda escrita em `leads` inclui `updated_at = now()` (não há trigger).
- **Server Actions do CRM** sempre começam com `await requireSession()` (não existe proxy.ts — ver CLAUDE.md). Páginas novas
  do CRM ficam em `src/app/crm/(protected)/…` e também chamam `requireSession()` no topo.
- Rotas públicas novas (depoimento, API) nunca expõem telefone ou dados de outros leads.
- **Runtime Cloudflare Workers** (OpenNext): nada de `fs`, nada de libs que dependem de Node nativo. `fetch` e Web Crypto ok;
  `node:crypto` ok (nodejs_compat). Não usar `export const runtime = "edge"`. Não recriar `proxy.ts`/`middleware.ts`.
- Datas: fuso **America/Manaus**. `data_evento` é `date` ("AAAA-MM-DD").
- Visual do CRM: mesmo estilo das páginas atuais (fundo `ink`, cartões `border-cream/10 bg-cream/5`, dourado `gold`,
  títulos `font-display`). **Tudo precisa funcionar no celular** (390px): o CRM já tem barra no topo + abas embaixo
  (CrmSidebar.tsx); lista vira cartão no celular.
- Sem dependências novas, exceto quando indicado (`pdf-lib` para o PDF). Nada de ORM.
- Leads de teste criados pelos agentes: nome começando com **`ZZTESTE`**, apagados no fim do teste.
- Não commitar, não dar push: o orquestrador integra, testa e publica.

## Banco — o que entra (Fase 1)

`leads` (colunas novas, todas opcionais):
- `retornar_em date` — lembrete de retorno (1)
- `origem text` — de onde veio: `site`, `instagram`, `indicacao`, `google`, `whatsapp`, `passou_na_frente`, `outro` (3).
  Leads do simulador ganham `site` por padrão no insert do quiz. (Coluna nova, NÃO mexer na constraint de `source`.)
- `valor_fechado integer`, `valor_sinal integer`, `valor_pago integer default 0`, `pagamento_final_em date` — financeiro (4)
- `checklist jsonb not null default '{}'` — checklist da festa (15)
- `recompra_avisada_em timestamptz` — controle do lembrete "festa do ano que vem" (8)
- `google_event_id text` — evento no Google Agenda (14)

Tabelas novas:
- `settings (key text primary key, value jsonb not null, updated_at timestamptz default now())` — configurações
  editáveis: `precos` (pacotes/preços do simulador), `condicoes_pagamento`, `link_avaliacao_google`,
  `modelos_whatsapp`, `google_calendar` (tokens). Leitura sempre com fallback para os padrões do código.
- `blocked_dates (data date primary key, motivo text, created_at timestamptz default now())` — datas bloqueadas (5)
- `waitlist (id uuid pk, lead_id uuid null references leads on delete set null, nome text, telefone text, data date not null,
  created_at, avisado_em timestamptz)` — lista de espera (9)
- `testimonials (id uuid pk, lead_id uuid null references leads on delete set null, token text unique, nome text, texto text,
  nota int, status text default 'pendente' check in ('pendente','aprovado','recusado'), created_at, respondido_em)` — depoimentos (11)
- `login_attempts (ip text, created_at timestamptz default now())` + índice em (ip, created_at) — trava de login (6)

## As melhorias (spec por item)

1. **Lembrete de retorno** — campo "Retornar em" na ficha (data + atalhos: amanhã, 3 dias, 1 semana, limpar). Dashboard:
   blocos "Retornos de hoje" e "Atrasados" (lista com link pra ficha). Lista de leads: filtro "Retorno: hoje/atrasados".
2. **Modelos de WhatsApp por fase** — na ficha, além do botão atual, menu "Mais mensagens" com: Primeiro contato (atual),
   Retomar simulação (atual), Cobrar resposta do orçamento, Reserva confirmada (sinal R$ 500), Lembrete do saldo,
   Pós-festa (agradece + pede avaliação no Google se houver link + link do depoimento do item 11). Textos com
   variáveis ({nome}, {tema}, {data}, {valor}, {saldo}, {link_avaliacao}, {link_depoimento}) editáveis em Configurações
   (setting `modelos_whatsapp`, com padrões no código).
3. **Origem do lead** — select na ficha/edição e no Novo lead; quiz grava `site`. Dashboard: "De onde vêm os leads"
   (barras simples em CSS, contagem e % dos fechados por origem).
4. **Financeiro da festa** — na ficha de lead fechado: valor fechado, sinal (default R$ 500), valor já pago, data do pagamento
   final; mostra "falta receber". Dashboard: "Faturamento do mês" (soma de `valor_fechado` das festas com `data_evento`
   no mês) e "A receber" (soma de valor_fechado − valor_pago das festas futuras).
5. **Agenda em calendário** — `/crm/agenda` vira calendário mensal (navegação mês a mês; no celular, lista por dia abaixo
   do mini-calendário). Festas fechadas em dourado, datas bloqueadas em cinza. Clicar num dia livre permite bloquear
   (com motivo); num bloqueado, desbloquear. `getBookedDates()` passa a incluir as bloqueadas → o simulador mostra ocupada.
6. **Trava de login** — `loginAction`: IP de `cf-connecting-ip` (fallback `x-forwarded-for`); 5 erros em 15 min → bloqueia
   15 min com mensagem clara. Registra só as falhas; limpa as do IP ao acertar. Apagar registros com mais de 1 dia.
7. **CRM como app (PWA)** — `manifest` escopado em `/crm` (nome "Rosa Buffet CRM", ícone da flor de lótus que já existe,
   cor de fundo ink, `display: standalone`, `start_url: /crm`), meta `apple-mobile-web-app-*` só no layout do CRM.
   Sem service worker.
8. **Festa do ano que vem** — festas fechadas de `tema_slug` infantil/aniversário/15 anos (qualquer tema que se repete;
   casamento e formatura NÃO) cuja data completa 1 ano em até 2 meses → aparecem no dashboard "Oferecer a festa do ano
   que vem" com WhatsApp pronto; ao enviar/marcar, grava `recompra_avisada_em`. Também entra no resumo diário (13).
9. **Lista de espera** — quando a data desejada de um lead já está ocupada, a ficha mostra "Data ocupada — pôr na lista
   de espera". Na Agenda, cada dia ocupado mostra a espera. Quando uma festa fechada muda de status (sai de fechado) ou
   de data, a data liberada mostra alerta no dashboard "Data liberada — N pessoas esperando" com WhatsApp pronto.
10. **Orçamento em PDF** — rota `GET /crm/leads/[id]/orcamento.pdf` (protegida por sessão) gerada com `pdf-lib`
    (funciona em Workers): logo, dados do cliente, tema, data, convidados, pacote e itens inclusos, valor
    (valor_fechado ou preço do pacote), condições de pagamento (setting), validade de 15 dias, contato. Botão
    "Orçamento em PDF" na ficha. Acentos em português precisam aparecer certos.
11. **Depoimentos** — tabela `testimonials`; na ficha (festas fechadas) botão "Pedir depoimento" gera token e link
    público `/depoimento/[token]` (nome, nota 1–5, texto, consentimento para publicar). CRM: página
    `/crm/depoimentos` para aprovar/recusar. Site: seção de depoimentos escritos aprovados junto do carrossel de prints,
    carregada no cliente via `GET /api/depoimentos` (a home é estática e o cache do OpenNext é só leitura — não depender
    de revalidatePath). Só primeiro nome + nota + texto aparecem no site.
12. **Preços e pacotes editáveis** — página `/crm/configuracoes`: tabela de preços por pacote × faixa de convidados
    (Premium, Gold, Kids × 80/100/120/150), nota de cada pacote; condições de pagamento; link de avaliação; modelos de
    WhatsApp; conexão Google Agenda. Setting `precos` com fallback para `quiz-data.ts`. `/orcamento` (já é
    force-dynamic) busca os preços do banco e passa para `PartyQuiz` via props — o cálculo do resultado usa os preços
    recebidos. `getPackagePrice` continua existindo como fallback.
13. **Resumo diário às 8h** — Cron Trigger da Cloudflare (`"triggers": {"crons": ["0 12 * * *"]}` no wrangler.jsonc)
    via Custom Worker do OpenNext (ver https://opennext.js.org/cloudflare/howtos/custom-worker): o `scheduled()` chama
    a rota interna `POST /api/cron/diario` pelo `WORKER_SELF_REFERENCE`, autenticada com token = HMAC-SHA256
    (SESSION_SECRET, "cron-diario") — sem secret novo. A rota monta: retornos de hoje + atrasados, festas da semana,
    leads novos das últimas 24h, recompras (8), datas liberadas com espera (9) → envia pelo ntfy (`notify.ts`) só se
    houver algo. Sem `NTFY_TOPIC`, não faz nada.
14. **Google Agenda (OAuth)** — em Configurações, botão "Conectar Google Agenda" (OAuth 2.0 web flow, escopo
    `calendar.events`, `access_type=offline`, `prompt=consent`); callback `/crm/google/callback` guarda o refresh token no
    setting `google_calendar`. Ao virar/alterar festa fechada com data → cria/atualiza evento de dia inteiro
    (título "Festa – {nome} ({tema})", descrição com telefone, convidados, pacote, link da ficha); ao sair de fechado →
    apaga. Tudo com `fetch` na REST API (sem googleapis). Sem `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, o botão
    mostra "Aguardando configuração". Falha no Google nunca impede salvar no CRM.
15. **Checklist da festa** — na ficha de lead fechado: cardápio definido, bolo, decoração, nº final de convidados,
    horário, degustação marcada (data), fornecedores/observações; itens marcáveis + campos curtos, salvos em
    `checklist jsonb`. Indicador "3/7 prontos" na agenda e no dashboard para festas dos próximos 30 dias.
16. **Funil em colunas (kanban)** — `/crm/funil`: colunas por status com cartões; mover por arrastar no computador e,
    no celular, por botão "Mover para…" (arrastar em tela de toque é ruim). Perdido pede motivo (mesma regra atual).
18. **Exportar planilha** — botão "Exportar CSV" na lista de leads (respeita filtros), rota protegida
    `GET /crm/leads/exportar.csv`, UTF-8 com BOM (abre certo no Excel), separador `;`.
19. **Lead duplicado** — quando o quiz cria lead com telefone (só dígitos, últimos 11) igual a outro dos últimos 90 dias,
    marca na ficha e na lista "Possível duplicado de {nome}" com link. Sem mesclar automático.

(17 — login por pessoa — fora desta rodada, por decisão do Saymon.)

## Fases e agentes (modelo sonnet; no máximo 2–3 em paralelo; partes que mexem nos mesmos arquivos ficam em série)

| Fase | Agente | Itens | Arquivos principais |
|---|---|---|---|
| 1 | Fundação | schema completo + apply; `settings.ts` (get/set com fallback); tipos e DAL das colunas novas; página `/crm/configuracoes` (esqueleto com seções) e itens novos na navegação (Funil, Depoimentos, Configurações — no celular, em "Mais") | schema.sql, lib/crm/*, CrmSidebar |
| 2 | Ficha & dashboard | 1, 2, 3, 4, 15, 19 | leads/[id], dashboard, leads list, actions |
| 3a | Agenda | 5, 9 | agenda, leads.ts (getBookedDates), quiz calendar |
| 3b | Segurança & app | 6, 7, 18 | login, layout CRM, rota CSV |
| 4a | Preços & PDF | 12, 10 | configuracoes, orcamento page, PartyQuiz, rota PDF |
| 4b | Depoimentos | 11 | rotas novas, Testimonials.tsx, /crm/depoimentos |
| 5a | Cron | 13, 8 | wrangler.jsonc, worker custom, /api/cron/diario |
| 5b | Funil | 16 | /crm/funil |
| 6 | Google Agenda | 14 | configuracoes, lib/google-calendar.ts, callback |
| 7 | Revisão final | tudo | revisor independente (sonnet) + docs (haiku) |

Depois de cada fase: orquestrador roda `tsc`, `eslint src`, `next build`, `opennextjs-cloudflare build`, teste no
workerd local (Playwright em 390px e 1366px nas telas afetadas), apaga os leads ZZTESTE, commit e push em `cloudflare`,
confere o deploy no ar.

## Riscos e como voltar atrás

- Algo quebra no ar → `git revert` do commit da fase + push (volta em ~5 min). O banco aditivo não quebra a versão anterior.
- Cron/Custom Worker falhar no build da Cloudflare → publicar a fase sem o cron e deixar para a manhã.
- Google: nada acontece sem as credenciais; se a API falhar, o CRM segue salvando normal.

## Pendências para a manhã (Saymon)

- Cadastrar `NTFY_TOPIC` na Cloudflare (aviso de lead e resumo diário dependem dele).
- Google Agenda: criar projeto/credencial OAuth no Google Cloud e cadastrar `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
  (guia será deixado no relatório); depois a Rosilene clica em "Conectar Google Agenda".
- Preencher link de avaliação do Google e revisar condições de pagamento em Configurações.
