# CLAUDE.md

Contexto para qualquer sessão do Claude Code que trabalhe neste repositório. Este projeto foi conduzido por sessões do Claude Code na web antes de ser clonado para uma máquina local — o histórico dessas sessões não está disponível aqui, então este arquivo é a fonte de contexto que o código sozinho não dá.

## Visão geral

Site institucional da **Rosa Buffet**, buffet e produção de eventos em Manaus-AM, com um simulador de orçamento em quiz (`/orcamento`) e um CRM interno (`/crm`) para acompanhar os leads que ele gera. Next.js 16 (App Router) + Tailwind CSS v4. O site institucional em si continua sem CMS (conteúdo/fotos vivem no repositório), mas **o projeto deixou de ser 100% estático**: há um banco de dados Postgres e Server Actions por trás do simulador e do CRM (ver seção dedicada).

Publicado na Vercel: projeto `rosa-buffet`, organização `saymonabraao0000-stacks-projects`. Deploy automático a cada push em `main`. Deploys de preview de outras branches exigem login na Vercel para visualização; só a produção (branch `main`) é pública sem login.

Repositório GitHub: `saymonabraao0000-stack/rosa-buffet`.

Não há mais publicação alternativa no GitHub Pages — existiu por um tempo (export estático) mas foi removida de propósito para viabilizar o backend (banco de dados e auth não podem ser exportados como `output: "export"`). Se você encontrar referências a isso em commits antigos, é resquício histórico.

## Stack e versões

- Next.js `16.3.6` (o adaptador da Cloudflare exige ≥ 16.3.3) (App Router, React Server Components, Server Actions)
- React `19.2.4` / React DOM `19.2.4`
- TypeScript `^5`, strict mode, alias `@/*` → `./src/*`
- Tailwind CSS `^4` — sem `tailwind.config.js`; tokens definidos em `@theme inline` dentro de [globals.css](src/app/globals.css) (cores `--color-ink`, `--color-gold`, `--color-cream` etc., fontes `--font-display`/`--font-body`)
- `framer-motion` para animações, `lucide-react` para ícones
- `@neondatabase/serverless` — cliente do Postgres (ver seção "Backend")
- ESLint 9 (flat config) com `eslint-config-next`
- Fontes: Playfair Display (display) + Inter (corpo), carregadas via `next/font/google` em [layout.tsx](src/app/layout.tsx)

Não há testes automatizados configurados neste projeto.

## Comandos

```bash
npm run dev     # servidor de desenvolvimento (localhost:3000)
npm run build   # build de produção (o que a Vercel roda)
npm run start   # serve o build de produção
npm run lint    # eslint

npx vercel link                     # conecta esta pasta ao projeto rosa-buffet na Vercel (uma vez só)
npx vercel env pull .env.local      # baixa DATABASE_URL/CRM_PASSWORD/SESSION_SECRET pro ambiente local
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
      (protected)/           # route group: layout chama requireSession() e monta o chrome do CRM
        page.tsx                # dashboard
        leads/page.tsx          # lista + filtros
        leads/novo/page.tsx     # cadastro manual de lead
        leads/[id]/page.tsx     # ficha do lead
        agenda/page.tsx         # datas de eventos fechados
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
    db/client.ts               # cliente Postgres (Neon), singleton exportado como `sql`
    crm/
      types.ts                   # Lead, LeadStatus, LeadFilters etc.
      leads.ts                   # toda a consulta/escrita de leads (DAL)
      notes.ts                   # anotações do lead
      session.ts                 # assina/valida o cookie de sessão (HMAC, node:crypto puro)
      require-session.ts         # checagem de sessão chamada dentro de cada Server Action sensível
      actions.ts                 # Server Actions do CRM (login, logout, status, sinal, notas, lead manual)
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

**Banco**: Postgres via [Neon](https://neon.tech), provisionado como Marketplace Integration da Vercel (dashboard → projeto `rosa-buffet` → Storage → Neon). Isso injeta `DATABASE_URL` automaticamente nos ambientes Production/Preview/Development da Vercel. Localmente: `npx vercel link` uma vez, depois `npx vercel env pull .env.local` sempre que as env vars mudarem no dashboard.

**Cliente**: [src/lib/db/client.ts](src/lib/db/client.ts) usa `@neondatabase/serverless` (não `@vercel/postgres` — esse pacote foi descontinuado pela Vercel em 2025; o caminho atual é `@neondatabase/serverless` direto). Exporta `sql`, uma tagged template. **Sem ORM** — as duas tabelas (`leads`, `lead_notes`) são pequenas o bastante pra SQL escrito à mão em [src/lib/crm/leads.ts](src/lib/crm/leads.ts) e [notes.ts](src/lib/crm/notes.ts) valer mais a pena que a cerimônia de um ORM. Filtros dinâmicos (a busca de `/crm/leads`) usam `sql.query(texto, params)` em vez da tagged template, para montar o `WHERE` condicionalmente.

**Schema**: [db/schema.sql](db/schema.sql) é a fonte da verdade — não há ferramenta de migração. Pra aplicar: `node --env-file=.env.local db/apply.mjs` (idempotente, usa `create table if not exists`), ou colar o SQL direto no SQL Editor do Neon (Vercel → Storage → Neon → "Open in Neon Console"). Duas tabelas: `leads` (contato, origem quiz/manual, status do funil, todas as respostas do quiz, `current_step`, `sinal_pago`) e `lead_notes` (anotações datadas, sem coluna de autor — login único, não por pessoa).

**Server Actions em vez de API routes**: todas as mutações (criar/atualizar lead, login/logout, mudar status, marcar sinal pago, anotar, cadastro manual) são `"use server"` — chamadas direto de componentes cliente (`PartyQuiz.tsx`, os componentes em `src/components/crm/`) sem precisar de `route.ts`. Duas famílias:
- [src/lib/quiz/actions.ts](src/lib/quiz/actions.ts) — públicas, sem checagem de sessão (é o site público respondendo o quiz).
- [src/lib/crm/actions.ts](src/lib/crm/actions.ts) — cada uma chama `requireSession()` internamente. Não existe `proxy.ts` (ver abaixo), e mesmo que existisse isso seria necessário: a própria documentação do Next.js avisa que Server Actions não herdam a proteção da rota onde são definidas (são tratadas como POST pra aquela rota, então um matcher que exclua a rota também abre a Server Action sem querer) — por isso a checagem fica dentro de cada ação sensível.

**Autenticação do `/crm`**: senha única compartilhada (não é login por pessoa — decisão explícita do dono, que quis algo simples). `CRM_PASSWORD` fica direto como env var na Vercel (não hasheada — é um segredo já protegido pelo cofre de env vars da Vercel, adequado pro nível de ameaça de uma ferramenta interna pequena). [src/lib/crm/session.ts](src/lib/crm/session.ts) assina um cookie de sessão com HMAC-SHA256 (`SESSION_SECRET`, outra env var) usando só `node:crypto` — nenhuma lib de auth foi adicionada. `requireSession()` valida esse cookie no layout de `(protected)`, no topo de cada página do CRM e em cada Server Action sensível.

**Sem `proxy.ts`/`middleware.ts`, de propósito** (removido em 2026-09-23 na migração para a Cloudflare): o adaptador `@opennextjs/cloudflare` ainda não suporta o proxy em runtime Node do Next 16. A proteção do `/crm` ficou toda no `requireSession()` (layout + cada página + cada Server Action). Não recriar o `proxy.ts` enquanto o site rodar na Cloudflare.

**Env vars necessárias** (Vercel dashboard → Settings → Environment Variables, todas em Production/Preview/**Development** — sem marcar Development, `vercel env pull` não traz pro `.env.local`):

| Nome | Pra quê |
|---|---|
| `DATABASE_URL` | Injetada automaticamente pela integração Neon |
| `CRM_PASSWORD` | Senha compartilhada de `/crm/login` |
| `SESSION_SECRET` | Chave HMAC do cookie de sessão — gerar com `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |

`.gitignore` já ignora `.env*`, então `.env.local` nunca vai pro git.

**`/crm` não está em `siteConfig.nav`** — de propósito, é uma ferramenta interna. O único link para ele é um atalho discreto "Área restrita" na barra inferior do [Footer.tsx](src/components/layout/Footer.tsx) (`rel="nofollow"`, pedido do Saymon em 2026-09-23), e `robots.ts` bloqueia `/crm` para buscadores.

## Fluxo de publicação

- Push em `main` → build automático na Vercel → publica em produção. Não precisa de passo manual.
- Previews de outras branches existem mas pedem login Vercel pra ver.
- Não há `vercel.json` no repositório — toda configuração de projeto/domínio/env vars da Vercel vive no dashboard, fora do controle de versão.

## Pendências / TODOs em aberto

- **Domínio definitivo: `rosabuffeteventos.com.br`** (sem o "e" do meio). **Registrado em 2026-09-23, vence em 2027-09-23** (renovação anual, paga por Pix pela dona). Titular: **CPF da Rosilene Moreira de Paula**, a dona (a ideia era o CNPJ do MEI 55.500.499/0001-98, mas saiu no CPF — é a mesma pessoa, deixado assim). Conta dela no Registro.br: ID `ROMPA342`, e-mail rosabuffet26@gmail.com. Contato técnico ficou `ROMPA342` — pendente trocar para o ID do Saymon. DNS ainda nos servidores do Registro.br (a/b.auto.dns.br), DNSSEC desligado. **Não usar `rosabuffet.com.br`**: é de OUTRO Rosa Buffet (titular Roselina Soares de Oliveira Barbeito). A dona é a mãe da Allyne, namorada do Saymon; o contato com ela passa pela Allyne. `siteConfig.url` em [site-config.ts:13](src/lib/site-config.ts#L13) e `email` ainda apontam para `rosabuffet.com.br` — trocar para `https://rosabuffeteventos.com.br` (sem www; o www redireciona) quando o domínio estiver apontado. Esse valor alimenta `canonical`, `sitemap.ts`, `robots.ts` e as meta tags Open Graph/Twitter em `layout.tsx`. Hospedagem decidida: Cloudflare Workers + OpenNext (branch `cloudflare`, Worker `rosa-buffet`, no ar em https://rosa-buffet.saymonabraao0000.workers.dev desde 2026-09-23); falta apontar o domínio e fazer o merge na `main`.
- **Links placeholder em `site-config.ts`**:
  - `social.facebook` ([site-config.ts:41](src/lib/site-config.ts#L41)) tem TODO explícito — aponta para `https://www.facebook.com/`, a home genérica do Facebook, não a página da empresa.
  - `googleMapsUrl`/`googleMapsEmbedUrl` ([site-config.ts:33-36](src/lib/site-config.ts#L33-L36)) **não têm TODO no código**, mas são apenas uma URL de busca do Google Maps montada a partir do endereço em texto (`query=Rua+São+João...`), não um link para uma ficha/perfil real do Google Business da Rosa Buffet. Funciona, mas vale trocar por um link de perfil real quando existir um.
- Vários cards de serviço em [site-data.ts](src/lib/site-data.ts) (festas infantis, eventos corporativos, chá revelação, buffet completo) ainda usam fotos de banco de imagens (Unsplash) como placeholder — cada um tem um TODO próprio no código indicando isso; substituir por fotos reais quando disponíveis, adicionando o arquivo em `public/images/eventos/` e trocando a URL.
- **Preços ilustrativos no simulador `/orcamento`**: o preço por convidado de cada nível de cardápio (`buffetTiers`) e o valor de cada opcional (`addons`), ambos em [quiz-data.ts](src/lib/quiz-data.ts), são valores inventados só para o cálculo funcionar de ponta a ponta — há um TODO explícito no topo de cada um. Cada card no quiz já mostra "(estimativa)" ao lado do valor, e o resultado final tem um aviso de que é sujeito a confirmação, mas os números em si **não são reais** e precisam ser substituídos pelos valores de custo por convidado da Rosa Buffet antes de tratar a estimativa como confiável.
- **Banco de dados tem leads fictícios de demonstração**: 10 leads de exemplo (nomes como "Ana Beatriz Souza", "Rafael Costa Lima" etc., alguns com notas) foram inseridos direto no banco pra o dono ver o CRM populado antes de ter clientes reais nele. Combinado que o Claude apaga quando o dono pedir — **se você é uma sessão futura e não recebeu esse pedido, não assuma que são dados reais nem os edite como se fossem**. Fora eles, o banco fica vazio até a equipe usar o `/orcamento`/`/crm/leads/novo` de verdade — não é bug, só reflete que ainda não começaram a operar por lá.
- **Senha do CRM é fraca**: `CRM_PASSWORD` está como `"rosa"` — fácil de adivinhar, sem limite de tentativas de login. Foi a senha que o dono escolheu de propósito (queria algo simples), mas veio com aviso explícito de que deveria trocar antes do CRM ter dado de cliente real valendo a pena proteger. Trocar em Vercel → projeto rosa-buffet → Settings → Environment Variables → `CRM_PASSWORD` (nos três ambientes) + `vercel env pull .env.local` local.
- **Sem aviso de privacidade/LGPD**: o quiz coleta nome e telefone de visitantes reais e grava num banco — dado pessoal, sob a LGPD. Hoje não existe nenhuma política de privacidade nem aviso de consentimento na etapa de contato do quiz. Ainda não foi pedido para o dono, mas é uma lacuna real, não só estética.
- **Sem proteção contra spam nas Server Actions públicas do quiz** (`createLeadAction`/`updateLeadAction`): qualquer um pode chamar essas ações diretamente via POST (é como Server Actions funcionam — não há como restringir isso por rota). Dado o porte do negócio, não foi adicionado CAPTCHA/rate limit; um honeypot simples seria a mitigação mais barata se leads falsos virarem um problema real no CRM.
- **`updated_at` de `leads` é setado manualmente em cada `UPDATE`** (não há trigger no banco) — se alguém adicionar uma nova função de escrita em [leads.ts](src/lib/crm/leads.ts), precisa lembrar de incluir `updated_at = now()` também.
