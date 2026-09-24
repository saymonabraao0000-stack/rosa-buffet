# CLAUDE.md

Contexto para qualquer sessão do Claude Code que trabalhe neste repositório. Este projeto foi conduzido por sessões do Claude Code na web antes de ser clonado para uma máquina local — o histórico dessas sessões não está disponível aqui, então este arquivo é a fonte de contexto que o código sozinho não dá.

## Visão geral

Site institucional da **Rosa Buffet**, buffet e produção de eventos em Manaus-AM, com um simulador de orçamento em quiz (`/orcamento`) e um CRM interno (`/crm`) para acompanhar os leads que ele gera. Next.js 16 (App Router) + Tailwind CSS v4. O site institucional em si continua sem CMS (conteúdo/fotos vivem no repositório), mas **o projeto deixou de ser 100% estático**: há um banco de dados Postgres e Server Actions por trás do simulador e do CRM (ver seção dedicada).

**NO AR em https://rosabuffeteventos.com.br desde 2026-09-23** (com e sem www), na **Cloudflare**: Worker `rosa-buffet` (conta saymonabraao0000, Workers Builds ligado ao GitHub, build `npx opennextjs-cloudflare build`, deploy `npx opennextjs-cloudflare deploy`). Por enquanto a branch de produção na Cloudflare é **`cloudflare`** — todo push nela publica. Nameservers: `armfazh.ns.cloudflare.com` / `veda.ns.cloudflare.com`. Endereço de teste: https://rosa-buffet.saymonabraao0000.workers.dev. Secrets do Worker: `DATABASE_URL`, `CRM_PASSWORD`, `SESSION_SECRET`, `NTFY_TOPIC`.

A publicação antiga na **Vercel** (projeto `rosa-buffet`, org `saymonabraao0000-stacks-projects`, deploy a cada push em `main`) ainda existe: o plano Hobby não permite uso comercial, por isso a saída. Desde 2026-09-24 a branch padrão do GitHub é `cloudflare` (a `main` ficou com a versão antiga da Vercel). Em 2026-09-24 o repositório foi **desconectado** do projeto da Vercel (Settings → Git → Disconnect): a Vercel não publica mais nada. Pendente (a partir de 2026-10-01): apagar o projeto da Vercel junto com o banco antigo da integração Neon — não antes, porque o banco antigo é a segurança até lá.

Repositório GitHub: `saymonabraao0000-stack/rosa-buffet`.

Não há mais publicação alternativa no GitHub Pages — existiu por um tempo (export estático) mas foi removida de propósito para viabilizar o backend (banco de dados e auth não podem ser exportados como `output: "export"`). Se você encontrar referências a isso em commits antigos, é resquício histórico.

## Stack e versões

- Next.js `16.3.6` (o adaptador da Cloudflare exige ≥ 16.3.3) (App Router, React Server Components, Server Actions)
- React `19.2.4` / React DOM `19.2.4`
- TypeScript `^5`, strict mode, alias `@/*` → `./src/*`
- Tailwind CSS `^4` — sem `tailwind.config.js`; tokens definidos em `@theme inline` dentro de [globals.css](src/app/globals.css) (cores `--color-ink`, `--color-gold`, `--color-cream` etc., fontes `--font-display`/`--font-body`)
- `framer-motion` para animações, `lucide-react` para ícones
- `@neondatabase/serverless` — cliente do Postgres (ver seção "Backend")
- `pdf-lib` — geração do orçamento em PDF (JS puro, roda no Cloudflare Workers)
- ESLint 9 (flat config) com `eslint-config-next`
- Fontes: Playfair Display (display) + Inter (corpo), carregadas via `next/font/google` em [layout.tsx](src/app/layout.tsx)

Não há testes automatizados configurados neste projeto.

## Comandos

```bash
npm run dev     # servidor de desenvolvimento (localhost:3000)
npm run build   # build do Next (a Cloudflare roda `npx opennextjs-cloudflare build`, que chama este)
npm run start   # serve o build de produção
npm run lint    # eslint

npx vercel link                     # conecta esta pasta ao projeto rosa-buffet na Vercel (uma vez só)
# (vercel env pull NÃO serve mais: o banco saiu da Vercel em 2026-09-24 — o .env.local tem o DATABASE_URL do Neon próprio)
node --env-file=.env.local db/apply.mjs   # aplica db/schema.sql no banco (idempotente, pode rodar de novo)
```

## Estrutura de pastas

```
src/
  app/
    page.tsx              # home (única rota com seções via âncora: #inicio, #sobre, #servicos, #galeria, #depoimentos, #contato)
    celebracoes/page.tsx   # portfólio de fotos (rota Next)
    orcamento/page.tsx      # simulador de orçamento em quiz (ver seção dedicada) — Server Component async, busca datas reservadas no banco
    crm/                    # CRM interno, não linkado na nav pública (ver seção "Backend")
      login/page.tsx
      google/
        conectar/route.ts       # inicia OAuth do Google Agenda
        callback/route.ts       # callback do OAuth (guarda refresh token)
      leads/
        [id]/orcamento/route.ts # PDF do orçamento (protegida por sessão)
        exportar.csv/route.ts   # exportação CSV dos leads (protegida por sessão)
      (protected)/            # route group: layout chama requireSession() e monta o chrome do CRM
        page.tsx                # dashboard
        leads/page.tsx          # lista + filtros
        leads/novo/page.tsx     # cadastro manual de lead
        leads/[id]/page.tsx     # ficha do lead
        leads/[id]/editar/page.tsx # edição de lead
        agenda/page.tsx         # calendário mensal de festas e bloqueios
        configuracoes/page.tsx  # preços, condições, Google Agenda, modelos WhatsApp
        depoimentos/page.tsx    # fila de depoimentos para aprovar/recusar
        funil/page.tsx          # kanban do funil (status em colunas)
    depoimento/
      [token]/page.tsx        # página pública de captação de depoimento (sem autenticação)
    api/
      depoimentos/route.ts    # GET: lista de depoimentos aprovados (para a home)
      cron/diario/route.ts    # POST: resumo diário às 8h (Cron Trigger Cloudflare)
    layout.tsx             # metadata, JSON-LD (schema.org LocalBusiness), fontes
    robots.ts, sitemap.ts
  components/
    layout/                # Navbar, Footer, WhatsAppFloatingButton
    sections/               # uma seção da home ou do portfólio por arquivo
    quiz/                   # PartyQuiz.tsx e QuizCalendar.tsx, usados só em /orcamento
    crm/                    # CrmSidebar, LoginForm, StatusForm, SinalToggle, NoteForm — os pedaços do CRM
    ui/                     # botões, contadores, wrappers genéricos
  lib/
    site-config.ts          # dados institucionais centrais (contato, endereço, links, nav pública — /crm não entra aqui)
    site-data.ts             # conteúdo das seções da home (diferenciais, serviços, FAQ — depoimentos saiu daqui, ver abaixo)
    portfolio-data.ts        # dados gerados das fotos do portfólio (ver seção "Fotos")
    testimonials-data.ts       # lista gerada das capturas de depoimentos reais (ver seção "Fotos")
    quiz-data.ts              # temas/faixas de convidados/cardápio/opcionais do simulador (preços ilustrativos — ver Pendências)
    availability-data.ts       # só reservationDeposit (R$500, valor real) e o helper formatISODate — datas reservadas de verdade vêm do banco agora
    notify.ts                  # envia notificação via ntfy quando há novo lead
    google-calendar.ts         # integração com Google Calendar API (criar/atualizar/apagar eventos)
    db/client.ts               # cliente Postgres (Neon), singleton exportado como `sql`
    crm/
      types.ts                   # Lead, LeadStatus, LeadFilters etc.
      leads.ts                   # toda a consulta/escrita de leads (DAL)
      notes.ts                   # anotações do lead
      session.ts                 # assina/valida o cookie de sessão (HMAC, node:crypto puro)
      require-session.ts         # checagem de sessão chamada dentro de cada Server Action sensível
      actions.ts                 # Server Actions do CRM (login, logout, status, sinal, notas, lead manual)
      settings.ts                # get/set das configurações do banco (preços, Google, etc) com fallback
      settings-actions.ts        # Server Actions para editar configurações em Configurações
      testimonials.ts            # consulta/escrita de depoimentos
      testimonial-actions.ts     # Server Actions para pedidos/aprovação de depoimentos
      google-actions.ts          # Server Actions para OAuth do Google Agenda
      agenda-actions.ts          # Server Actions para bloquear/desbloquear datas
      checklist.ts               # helpers para a festa (itens do checklist)
      funil.ts                   # helpers do funil kanban (cálculo de colunas, contagens)
      daily.ts                   # montagem do resumo diário (retornos, recompras, datas liberadas)
      login-attempts.ts          # trava de login por IP (5 erros em 15 min)
      manaus-date.ts             # conversões de data/hora para fuso de Manaus
      whatsapp.ts                # helpers para URLs e templates de WhatsApp
      phone-mask.ts              # máscara de telefone
    quiz/actions.ts             # Server Actions públicas chamadas pelo quiz (createLeadAction, updateLeadAction)
db/
  schema.sql                 # schema do Postgres (tabelas leads e lead_notes), fonte da verdade
  apply.mjs                  # aplica schema.sql no banco apontado por DATABASE_URL
public/
  images/
    eventos/                # fotos reais soltas, usadas na home (hero, about, galeria, cards de serviço)
    portfolio/<tema>/        # as 110 fotos do portfólio, organizadas por tema
    depoimentos/             # 30 capturas de tela reais de depoimentos (ver seção "Fotos")
  portfolio.html             # segundo portfólio, standalone (ver seção "Dois portfólios")
```

## Fotos: onde ficam e como adicionar

- Fotos soltas usadas na home (hero, "Sobre", galeria, cards de serviço) ficam em `public/images/eventos/` e são referenciadas diretamente por caminho em [site-data.ts](src/lib/site-data.ts).
- As 110 fotos do portfólio ficam em `public/images/portfolio/<tema>/`, uma pasta por tema (`quinze-anos`, `casamentos`, `infantil`, `formaturas`, `aniversarios`).
- [portfolio-data.ts](src/lib/portfolio-data.ts) é **gerado**, não escrito à mão: é uma lista de `{ src, w, h }` por foto, com `w`/`h` extraídos das dimensões reais de cada arquivo. Isso existe para o Next poder reservar o espaço da imagem sem esperar o carregamento (evita layout shift), mesmo a lista sendo estática.
  - As dimensões foram extraídas com `sharp`. **`sharp` não está em `package.json`** (nem em `dependencies` nem em `devDependencies`) — só sobrou um rastro dele em `package-lock.json`, o que indica que foi instalado ad-hoc (`npm i -D sharp` + script descartável) na sessão que gerou o arquivo, e não há script de geração commitado no repositório.
  - **Para adicionar fotos**: coloque o(s) arquivo(s) na pasta do tema em `public/images/portfolio/<tema>/`, depois regenere `portfolio-data.ts` — reinstale `sharp` temporariamente, leia as dimensões de cada arquivo da pasta e reescreva o array `portfolioCategories` (ou peça para o Claude fazer isso). Não edite as dimensões à mão.
- As duas telas de portfólio ([celebracoes/page.tsx](src/app/celebracoes/page.tsx) e `public/portfolio.html`) consomem esse mesmo conjunto de 110 fotos — mudar as fotos do portfólio afeta as duas.
- **Depoimentos** (seção "Depoimentos" da home, [Testimonials.tsx](src/components/sections/Testimonials.tsx)): 30 capturas de tela reais de conversas com clientes (Instagram/WhatsApp), fornecidas pelo dono do negócio, em `public/images/depoimentos/depoimento-01.jpeg` a `depoimento-30.jpeg`. Catalogadas com dimensões reais em [testimonials-data.ts](src/lib/testimonials-data.ts), mesmo esquema do portfólio (mas sem sharp — usei Pillow/Python, que já estava disponível na sessão). Renderizadas em carrossel infinito CSS puro (`.animate-marquee` em [globals.css](src/app/globals.css)). **Para adicionar mais**: solte o arquivo em `public/images/depoimentos/`, renomeie para o próximo `depoimento-NN.jpeg` e adicione a entrada com as dimensões reais em `testimonials-data.ts`.

## Os dois portfólios (e por que ambos existem)

1. **`/celebracoes`** — rota Next normal ([celebracoes/page.tsx](src/app/celebracoes/page.tsx), com [PortfolioHeader.tsx](src/components/sections/PortfolioHeader.tsx) e [PortfolioGallery.tsx](src/components/sections/PortfolioGallery.tsx)). Usa `next/image`, filtro por tema, paginação "Ver mais" (12 fotos por vez) e lightbox. É a versão integrada ao site, navegável pelo menu.
2. **`public/portfolio.html`** — página estática autocontida (CSS e JS inline, um único arquivo de ~800 linhas), com os mesmos temas e as mesmas 110 fotos, mas reimplementados à mão em HTML/CSS/JS puro. Os caminhos de imagem são **relativos** (`images/portfolio/...`, sem barra inicial), então o arquivo funciona sozinho: pode ser enviado por WhatsApp/e-mail como arquivo, aberto localmente, ou hospedado em qualquer lugar (nem precisa do Next) — desde que a pasta `images/` vá junto ao lado dele. É o motivo de existir apesar de duplicar a lógica de `/celebracoes`: serve a um caso de uso que uma rota Next não cobre (arquivo único, sem servidor, sem dependências de build).

Editar um dos dois **não** atualiza o outro automaticamente — são implementações independentes que só compartilham os arquivos de imagem.

## `/orcamento` — simulador de festa (quiz)

Rota imersiva (sem `Navbar`/`Footer` normais, só um cabeçalho mínimo próprio) em [orcamento/page.tsx](src/app/orcamento/page.tsx), renderizando [PartyQuiz.tsx](src/components/quiz/PartyQuiz.tsx) — um wizard de uma pergunta por tela, estilo Typeform (barra de progresso, cards com letra A/B/C, avanço automático ao escolher, "pressione Enter" nos campos de texto), pedido explicitamente pelo dono do site inspirado no fluxo de diagnóstico de `mazzeoia.com.br`.

Fluxo: boas-vindas → **contato (nome + telefone)** → tema da festa (reaproveita as fotos/categorias de `portfolio-data.ts`) → faixa de convidados → data desejada (calendário próprio em [QuizCalendar.tsx](src/components/quiz/QuizCalendar.tsx)) → nível de cardápio → opcionais (multi-seleção) → resultado.

**Captura de lead logo no início, de propósito**: assim que a pessoa preenche nome+telefone (primeira etapa depois das boas-vindas), o quiz já chama `createLeadAction` e cria a linha em `leads` no banco — antes mesmo de saber tema, convidados etc. Cada etapa seguinte (`selectAndAdvance`/`handleDataContinue`/`handleSeeEstimate` em `PartyQuiz.tsx`) chama `updateLeadAction` com o campo respondido **sem `await` bloqueando a navegação** (erro de rede não trava o quiz, só perde aquele registro pontual) e grava `current_step`, o que dá visibilidade de abandono: se a pessoa fechar o quiz no meio, o lead já existe no CRM com telefone + o que ela respondeu até ali, pronto pra follow-up manual. `orcamento/page.tsx` roda com `export const dynamic = "force-dynamic"` porque busca dados do banco a cada request (sem isso o Next poderia tentar pré-renderizar a página uma vez só no build, com as datas reservadas desatualizadas).

O resultado calcula uma faixa de valor estimado (`calculateEstimate` em [quiz-data.ts](src/lib/quiz-data.ts)) e monta uma mensagem de WhatsApp pré-preenchida com todas as respostas via `buildWhatsappUrl` (o mesmo helper usado no resto do site) — isso continua sendo o "orçamento exato", só que agora em paralelo ao registro no CRM.

**Datas**: `QuizCalendar` recebe `bookedDates: string[]` como prop (não busca mais nada sozinho) — vem de `getBookedDates()` em [leads.ts](src/lib/crm/leads.ts), que consulta `leads` com `status = 'fechado'`. `reservationDeposit` (R$ 500, valor real informado pelo dono do negócio) continua em [availability-data.ts](src/lib/availability-data.ts), que agora só guarda essa constante e o helper `formatISODate` — a lista de datas reservadas deixou de existir ali.

## Backend: banco de dados, CRM e autenticação

Adicionado para dar suporte ao `/orcamento` (captura de lead) e ao `/crm` (painel interno). Antes disso o site era 100% estático; agora depende de Postgres em produção.

**Banco**: Postgres no **[Neon](https://neon.tech), conta própria do Saymon** (login com o GitHub saymonabraao0000-stack), projeto `rosa-buffet` (id `hidden-surf-41864124`), Postgres 18, AWS us-east-1, desde **2026-09-24**. Começou limpo: só o schema, sem copiar os leads de teste do banco antigo. O banco antigo (criado pela integração Neon da Vercel, endpoint `ep-muddy-king-…`) ficou parado como segurança — endereço guardado em `.env.antigo` (fora do git); **pode ser apagado a partir de 2026-10-01**. **Backup**: GitHub Actions `.github/workflows/backup-banco.yml` roda `pg_dump` todo dia às 3h de Manaus (e manualmente em Actions → Backup do banco); o `.dump` fica como artefato por 90 dias; usa o secret `DATABASE_URL_BACKUP` (conexão direta, sem `-pooler`). Restaurar: `pg_restore --clean --no-owner -d "<url>" arquivo.dump`.

**Cliente**: [src/lib/db/client.ts](src/lib/db/client.ts) usa `@neondatabase/serverless` (não `@vercel/postgres` — esse pacote foi descontinuado pela Vercel em 2025; o caminho atual é `@neondatabase/serverless` direto). Exporta `sql`, uma tagged template. **Sem ORM** — as duas tabelas (`leads`, `lead_notes`) são pequenas o bastante pra SQL escrito à mão em [src/lib/crm/leads.ts](src/lib/crm/leads.ts) e [notes.ts](src/lib/crm/notes.ts) valer mais a pena que a cerimônia de um ORM. Filtros dinâmicos (a busca de `/crm/leads`) usam `sql.query(texto, params)` em vez da tagged template, para montar o `WHERE` condicionalmente.

**Schema**: [db/schema.sql](db/schema.sql) é a fonte da verdade — não há ferramenta de migração. Pra aplicar: `node --env-file=.env.local db/apply.mjs` (idempotente, usa `create table if not exists`), ou colar o SQL direto no SQL Editor do Neon (Vercel → Storage → Neon → "Open in Neon Console"). **Regra obrigatória**: o banco só recebe mudanças **aditivas** (tabelas novas, colunas novas com `if not exists`) no fim do arquivo, nunca `drop`, nunca alterar/remover coluna ou constraint existente. Tabelas:
- `leads`: contato, origem (site/instagram/etc), status do funil, respostas do quiz, `current_step`, `sinal_pago`, e colunas novas — `retornar_em` (lembrete), `origem` (rastreamento), `valor_fechado/sinal/pago` (financeiro), `pagamento_final_em`, `checklist` (festa), `recompra_avisada_em` (controle de recompra), `google_event_id` (sincronização).
- `lead_notes`: anotações datadas (sem autor — login único, não por pessoa).
- `settings` (novo): configurações editáveis (preços, condições de pagamento, link de avaliação, modelos de WhatsApp, tokens Google).
- `blocked_dates` (novo): datas bloqueadas manualmente (entram junto em `getBookedDates()` para o simulador).
- `waitlist` (novo): lista de espera para datas ocupadas.
- `testimonials` (novo): depoimentos pendentes/aprovados/recusados com token público.
- `login_attempts` (novo): registra falhas de login por IP para trava de 15 min após 5 erros em 15 min.

**Server Actions em vez de API routes**: todas as mutações (criar/atualizar lead, login/logout, mudar status, marcar sinal pago, anotar, cadastro manual) são `"use server"` — chamadas direto de componentes cliente (`PartyQuiz.tsx`, os componentes em `src/components/crm/`) sem precisar de `route.ts`. Duas famílias:
- [src/lib/quiz/actions.ts](src/lib/quiz/actions.ts) — públicas, sem checagem de sessão (é o site público respondendo o quiz).
- [src/lib/crm/actions.ts](src/lib/crm/actions.ts) — cada uma chama `requireSession()` internamente. Não existe `proxy.ts` (ver abaixo), e mesmo que existisse isso seria necessário: a própria documentação do Next.js avisa que Server Actions não herdam a proteção da rota onde são definidas (são tratadas como POST pra aquela rota, então um matcher que exclua a rota também abre a Server Action sem querer) — por isso a checagem fica dentro de cada ação sensível.

**Autenticação do `/crm`**: senha única compartilhada (não é login por pessoa — decisão explícita do dono, que quis algo simples). `CRM_PASSWORD` fica direto como env var na Vercel (não hasheada — é um segredo já protegido pelo cofre de env vars da Vercel, adequado pro nível de ameaça de uma ferramenta interna pequena). [src/lib/crm/session.ts](src/lib/crm/session.ts) assina um cookie de sessão com HMAC-SHA256 (`SESSION_SECRET`, outra env var) usando só `node:crypto` — nenhuma lib de auth foi adicionada. `requireSession()` valida esse cookie no layout de `(protected)`, no topo de cada página do CRM e em cada Server Action sensível.

**Sem `proxy.ts`/`middleware.ts`, de propósito** (removido em 2026-09-23 na migração para a Cloudflare): o adaptador `@opennextjs/cloudflare` ainda não suporta o proxy em runtime Node do Next 16. A proteção do `/crm` ficou toda no `requireSession()` (layout + cada página + cada Server Action). Não recriar o `proxy.ts` enquanto o site rodar na Cloudflare.

**Env vars necessárias**: desde a migração para Cloudflare (2026-09-23), as env vars **não estão mais na Vercel**, mas no **Worker `rosa-buffet` da Cloudflare** (Cloudflare Dashboard → Workers & Pages → rosa-buffet → Settings → **Variables and Secrets**). O `.env.local` (ignorado por `.gitignore`) aponta para o banco de **PRODUÇÃO** — use `npx vercel env pull .env.local` para trazer `DATABASE_URL` localmente se precisar (só se houver integração Neon ativa na Vercel, senão coloque a URL do banco manualmente).

| Nome | Tipo | Pra quê |
|---|---|---|
| `DATABASE_URL` | Env var | URL de conexão do Postgres (Neon) — para desenvolvimento local, puxada via `vercel env pull`. Em produção é Secret do Worker rosa-buffet na Cloudflare (já cadastrado). |
| `CRM_PASSWORD` | Secret | Senha compartilhada de `/crm/login` — trocar valor antes de produção |
| `SESSION_SECRET` | Secret | Chave HMAC do cookie de sessão e do token do cron — gerar com `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NTFY_TOPIC` | Secret | Tópico do [ntfy.sh](https://ntfy.sh) que recebe avisos de lead novo e resumo diário. O nome é o segredo. Sem ela, avisos não são enviados. |
| `GOOGLE_CLIENT_ID` | Secret | ID do cliente OAuth 2.0 do Google Cloud (ativação em [Planos/google-agenda-ativacao.md](Planos/google-agenda-ativacao.md)). Sem ela, botão "Conectar Google Agenda" fica desabilitado. |
| `GOOGLE_CLIENT_SECRET` | Secret | Chave secreta do cliente OAuth 2.0 do Google Cloud. Sem ela, idem. |
| `SITE_ORIGIN` | Env var (opcional) | Origin completo do site (ex: `https://rosabuffeteventos.com.br`), usado em callbacks. Se vazio, assume `https://rosabuffeteventos.com.br`. |

`.gitignore` já ignora `.env*`, então `.env.local` nunca vai pro git.

**`/crm` não está em `siteConfig.nav`** — de propósito, é uma ferramenta interna. O único link para ele é um atalho discreto "Área restrita" na barra inferior do [Footer.tsx](src/components/layout/Footer.tsx) (`rel="nofollow"`, pedido do Saymon em 2026-09-23), e `robots.ts` bloqueia `/crm` para buscadores.

## Recursos do CRM (setembro/2026)

O CRM ganhou na madrugada de 23→24/09/2026 (fases 1–6 do plano `Planos/crm-melhorias-2026-09-24.md`) as seguintes capacidades (todos os itens da lista abaixo):

1. **Lembrete de retorno** — data + atalhos (amanhã, 3 dias, 1 semana, limpar) na ficha; Dashboard mostra retornos de hoje/atrasados; Lista tem filtro.
2. **Modelos de WhatsApp editáveis** — menu "Mais mensagens" na ficha com textos por fase (primeiro contato, retomar simulação, cobrar resposta, reserva confirmada, lembrete de saldo, pós-festa); variáveis (`{nome}`, `{tema}`, `{data}`, `{valor}`, etc) editáveis em Configurações.
3. **Origem do lead** — rastreamento: `site`, `instagram`, `indicacao`, `google`, `whatsapp`, `passou_na_frente`, `outro`. Quiz grava `site` por padrão. Dashboard mostra distribuição por origem (% dos fechados).
4. **Financeiro** — na ficha de festa fechada: valor fechado, sinal (default R$ 500), valor já pago, data pagamento final. Dashboard: faturamento do mês + a receber.
5. **Agenda em calendário** — `/crm/agenda` monta calendário mensal; festas fechadas em dourado, bloqueios em cinza; clicar em dia livre → bloquear (com motivo); em bloqueado → desbloquear. `getBookedDates()` inclui bloqueios.
6. **Trava de login** — 5 erros em 15 min → bloqueia 15 min. Registra IP do header `cf-connecting-ip` (fallback `x-forwarded-for`).
7. **App no celular** — PWA manifest em `/crm` (nome "Rosa Buffet CRM", ícone, `display: standalone`). Sem service worker.
8. **Festa do ano que vem** — festas infantil/aniversário/15 anos (temas repetíveis) com 1 ano completo em até 2 meses aparecem no dashboard; ao marcar, grava `recompra_avisada_em`. Entra no resumo diário.
9. **Lista de espera** — quando data já está ocupada, ficha mostra "pôr na lista de espera". Agenda mostra espera por dia. Data liberada → alerta no dashboard com WhatsApp pronto.
10. **Orçamento em PDF** — rota `GET /crm/leads/[id]/orcamento.pdf` (protegida por sessão), gerada com `pdf-lib`. Botão na ficha. Acentos em português aparecem correto.
11. **Depoimentos com moderação** — na ficha (festas fechadas): "Pedir depoimento" gera token, link público `/depoimento/[token]` (nome, nota 1–5, texto, consentimento). CRM: `/crm/depoimentos` aprova/recusa. Site: seção nova (só aprovados) junto ao carrossel de prints, carregada via `GET /api/depoimentos`.
12. **Preços e pacotes editáveis** — página `/crm/configuracoes`: tabela preços × pacotes × convidados, notas dos pacotes. Setting `precos` com fallback. `/orcamento` busca do banco dinamicamente.
13. **Resumo diário às 8h** — Cron Trigger Cloudflare (`0 12 * * *` em UTC = 8h de Manaus). Monta: retornos de hoje/atrasados, festas da semana, leads novos 24h, recompras, datas liberadas → envia via ntfy se houver algo.
14. **Google Agenda (OAuth)** — em Configurações: "Conectar Google Agenda" (OAuth 2.0, escopo `calendar.events`, `offline`). Callback guarda refresh token. Festa fechada com data → cria/atualiza evento de dia inteiro no Google; sai de fechado → apaga. Sem credenciais, botão desabilitado. (Guia de ativação: [Planos/google-agenda-ativacao.md](Planos/google-agenda-ativacao.md).)
15. **Checklist da festa** — na ficha de festa fechada: cardápio, bolo, decoração, nº final convidados, horário, degustação, fornecedores/obs. Itens marcáveis, indicador "3/7 prontos" na agenda e dashboard.
16. **Funil em colunas (kanban)** — `/crm/funil`: colunas por status; arrastar no computador, botão "Mover…" no celular. Perdido pede motivo.
18. **Exportar CSV** — botão "Exportar CSV" na lista de leads (respeita filtros), rota `GET /crm/leads/exportar.csv` (UTF-8 com BOM, separador `;`).
19. **Lead duplicado** — quando quiz cria lead com telefone igual a outro dos últimos 90 dias, marca na ficha e lista "Possível duplicado de {nome}" com link. Sem mesclar automático.

**Item 17 (login por pessoa)** ficou para depois por decisão do Saymon em 2026-09-23 — mantém a senha única.
- **Alerta de lead sem resposta** (2026-09-24): Cron Trigger `*/15 * * * *` → `POST /api/cron/sem-resposta` ([sem-resposta.ts](src/lib/crm/sem-resposta.ts)). Lead do simulador ainda "novo" 1h depois gera um aviso no ntfy, uma vez só (`leads.alerta_sem_resposta_em`), só entre 7h e 22h de Manaus e para leads de até 3 dias. O `custom-worker.ts` escolhe a rota pelo `event.cron`; o token dos crons fica em [cron-auth.ts](src/lib/cron-auth.ts).
- **Agendamento de visitas** (2026-09-24): página pública `/visita` (dia → horário livre → nome/WhatsApp; anti-spam igual ao simulador; `.ics` em `/visita/[id]/ics`), tabela `visitas` com índice único parcial em (data, hora) para status ativos (dois clientes nunca pegam o mesmo horário). Horários em Configurações → Visitas (setting `visitas_config`, padrão ter–sáb 9h–17h, 1 h, antecedência 12 h, exclui dias com festa/bloqueio). No CRM: `/crm/visitas`, cor própria na Agenda, bloco na ficha do lead. Aviso push "Visita agendada". Botão de entrada no fim do simulador, nas páginas de pacote e em /links. Em teste local, `DISABLE_PUSH=1` (no `.dev.vars`) desliga o envio de push.
- **Pedir avaliação** (2026-09-24): festas fechadas de 2 a 10 dias atrás aparecem no dashboard com o WhatsApp pós-festa (link do Google + link de depoimento reaproveitado) e "Já pedi" (`leads.avaliacao_pedida_em`); também entram no resumo das 8h ([pos-festa.ts](src/lib/crm/pos-festa.ts)).
- **SEO local** (2026-09-24): 7 páginas `/festas/<slug>` (buffet-infantil, festa-de-15-anos, buffet-para-casamento, festa-de-formatura, festa-de-aniversario, eventos-corporativos, cha-revelacao — todas terminando em `-manaus`) + índice `/festas`, conteúdo em [festas-data.ts](src/lib/festas-data.ts) só com fatos do código, JSON-LD FAQPage/BreadcrumbList, links no rodapé e nos cartões de serviço. `layout.tsx` com JSON-LD EventVenue/FoodEstablishment (priceRange derivado dos pacotes) + WebSite; robots bloqueia /crm, /api/, /depoimento/ e /visita/*/ics; `public/llms.txt` para IAs. Facebook real (`rosa.buffet.77`) entrou em 2026-09-24. Pendente: CEP/coordenadas (ver "Google e SEO").

## Fluxo de publicação

**Produção é a branch `cloudflare`** na Cloudflare (não mais `main` na Vercel). Todo push em `cloudflare` dispara o build do OpenNext + deploy automático no Worker `rosa-buffet`. Não precisa de passo manual.

- O Next roda via OpenNext (Cloudflare Workers); o `custom-worker.ts` é o `main` do wrangler e inclui o handler do cron diário (item 13).
- Desenvolvimento: `npm run dev` (localhost:3000).
- Build/teste local: `npx opennextjs-cloudflare build` + `npx wrangler dev` (simula Workers localmente).
- Deploy: `npx opennextjs-cloudflare deploy` (ou apenas push em `cloudflare`).

## Pendências / TODOs em aberto

- **Google Agenda** — adiado por decisão do Saymon em 2026-09-24 (não cadastrar agora). Quando for ativar: `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` nos secrets do Worker, depois Rosilene conecta em `/crm/configuracoes`. Guia: [Planos/google-agenda-ativacao.md](Planos/google-agenda-ativacao.md).
- **Preencher configurações em `/crm/configuracoes`**:
  - Link de avaliação do Google (mensagem pós-festa) — sai do Perfil da Empresa (ver "Google e SEO" abaixo), depende de acesso de administrador.
  - Revisar/ajustar preços dos pacotes (setting `precos`; fallback ilustrativo em [quiz-data.ts](src/lib/quiz-data.ts)).
  - Revisar/ajustar condições de pagamento (padrão: "Sinal de R$ 500 na reserva da data; restante até 7 dias antes da festa.").
- **Domínio `rosabuffeteventos.com.br`** — registrado em 2026-09-23, vence em 2027-09-23 (renovação anual, Pix pela dona). Titular: CPF da Rosilene Moreira de Paula. Conta Registro.br ID `ROMPA342` (Saymon tem acesso; trocar o contato técnico não é necessário por ora — decisão de 2026-09-24). **Não usar `rosabuffet.com.br`**: é de outro buffet (Roselina Soares).
- **Links placeholder em [site-config.ts](src/lib/site-config.ts)**:
  - `googleMapsUrl`/`googleMapsEmbedUrl`: busca por endereço em texto — trocar pelo link do Perfil da Empresa quando houver acesso.
- **Fotos pedidas à família (2026-09-24)** — evento corporativo, chá revelação, aniversário adulto (só há 2), salão, comida/buffet servido, equipe. Hoje `/festas/eventos-corporativos-manaus` e `/festas/cha-revelacao-manaus` e os cards de serviço correspondentes em [site-data.ts](src/lib/site-data.ts) usam fotos de outros temas.
- **Vercel** — a partir de 2026-10-01, apagar o projeto antigo junto com o banco antigo da integração Neon.

## Google e SEO (fora do site)

- **Search Console** — ligado em 2026-09-24, propriedade do tipo Domínio na conta do Saymon, com a Rosilene como proprietária também. Verificação por TXT `google-site-verification=...` no DNS da Cloudflare (**não apagar**). Sitemap enviado com o endereço completo (propriedade Domínio não aceita só `sitemap.xml`); indexação solicitada para a home, os 3 `/festas` principais (infantil, 15 anos, casamento) e `/orcamento`.
- **Perfil da Empresa no Google** — já existe: "Rosa Buffet Eventos", 4,6 com 266 avaliações, mesmo endereço do site. Administrado pelo Wellington (filho da Rosilene, também organiza festas no salão). Categoria atual **"Restaurante"** (errada) — pendente o Wellington trocar para "Buffet" + "Salão de festas" e adicionar Saymon e Rosilene como administradores. **Não reivindicar o perfil** pelo "É proprietário desta empresa?" (abriria disputa com o Wellington).
- **Telefones diferentes de propósito** (decisão da família, 2026-09-24): o perfil do Google fica com o número do Wellington, (92) 99459-8954; o site, o CRM e os PDFs ficam com o da Rosilene, (92) 99207-3047. Não "corrigir" um pelo outro.
- **`updated_at` é manual** — toda escrita em `leads` deve incluir `updated_at = now()` (sem trigger). Se adicionar função nova em [leads.ts](src/lib/crm/leads.ts), lembrar disso.
