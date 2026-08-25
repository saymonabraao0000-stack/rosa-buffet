# CLAUDE.md

Contexto para qualquer sessão do Claude Code que trabalhe neste repositório. Este projeto foi conduzido por sessões do Claude Code na web antes de ser clonado para uma máquina local — o histórico dessas sessões não está disponível aqui, então este arquivo é a fonte de contexto que o código sozinho não dá.

## Visão geral

Site institucional da **Rosa Buffet**, buffet e produção de eventos em Manaus-AM. Next.js 16 (App Router) + Tailwind CSS v4, sem CMS nem backend — todo o conteúdo (textos, dados de contato, fotos) vive no próprio repositório.

Publicado na Vercel: projeto `rosa-buffet`, organização `saymonabraao0000-stacks-projects`. Deploy automático a cada push em `main`. Deploys de preview de outras branches exigem login na Vercel para visualização; só a produção (branch `main`) é pública sem login.

Repositório GitHub: `saymonabraao0000-stack/rosa-buffet`.

## Stack e versões

- Next.js `16.2.10` (App Router, React Server Components)
- React `19.2.4` / React DOM `19.2.4`
- TypeScript `^5`, strict mode, alias `@/*` → `./src/*`
- Tailwind CSS `^4` — sem `tailwind.config.js`; tokens definidos em `@theme inline` dentro de [globals.css](src/app/globals.css) (cores `--color-ink`, `--color-gold`, `--color-cream` etc., fontes `--font-display`/`--font-body`)
- `framer-motion` para animações, `lucide-react` para ícones
- ESLint 9 (flat config) com `eslint-config-next`
- Fontes: Playfair Display (display) + Inter (corpo), carregadas via `next/font/google` em [layout.tsx](src/app/layout.tsx)

Não há testes automatizados configurados neste projeto.

## Comandos

```bash
npm run dev     # servidor de desenvolvimento (localhost:3000)
npm run build   # build de produção (Vercel usa isso; ver seção GITHUB_PAGES abaixo)
npm run start   # serve o build de produção
npm run lint    # eslint
```

## Estrutura de pastas

```
src/
  app/
    page.tsx              # home (única rota com seções via âncora: #inicio, #sobre, #servicos, #galeria, #depoimentos, #contato)
    celebracoes/page.tsx   # portfólio de fotos (rota Next)
    layout.tsx             # metadata, JSON-LD (schema.org LocalBusiness), fontes
    robots.ts, sitemap.ts  # gerados em build, force-static (ver seção GITHUB_PAGES)
  components/
    layout/                # Navbar, Footer, WhatsAppFloatingButton
    sections/               # uma seção da home ou do portfólio por arquivo
    ui/                     # botões, contadores, wrappers genéricos
  lib/
    site-config.ts          # dados institucionais centrais (contato, endereço, links, nav)
    site-data.ts             # conteúdo das seções da home (diferenciais, serviços, depoimentos, FAQ)
    portfolio-data.ts        # dados gerados das fotos do portfólio (ver seção "Fotos")
    base-path.ts              # helper de subcaminho para o modo GitHub Pages
    pages-image-loader.ts      # loader de imagens custom para o modo GitHub Pages
public/
  images/
    eventos/                # fotos reais soltas, usadas na home (hero, about, galeria, cards de serviço)
    portfolio/<tema>/        # as 110 fotos do portfólio, organizadas por tema
  portfolio.html             # segundo portfólio, standalone (ver seção "Dois portfólios")
.github/workflows/
  github-pages.yml           # publicação alternativa no GitHub Pages (ver seção dedicada)
```

## Fotos: onde ficam e como adicionar

- Fotos soltas usadas na home (hero, "Sobre", galeria, cards de serviço) ficam em `public/images/eventos/` e são referenciadas diretamente por caminho em [site-data.ts](src/lib/site-data.ts).
- As 110 fotos do portfólio ficam em `public/images/portfolio/<tema>/`, uma pasta por tema (`quinze-anos`, `casamentos`, `infantil`, `formaturas`, `aniversarios`).
- [portfolio-data.ts](src/lib/portfolio-data.ts) é **gerado**, não escrito à mão: é uma lista de `{ src, w, h }` por foto, com `w`/`h` extraídos das dimensões reais de cada arquivo. Isso existe para o Next poder reservar o espaço da imagem sem esperar o carregamento (evita layout shift), mesmo a lista sendo estática.
  - As dimensões foram extraídas com `sharp`. **`sharp` não está em `package.json`** (nem em `dependencies` nem em `devDependencies`) — só sobrou um rastro dele em `package-lock.json`, o que indica que foi instalado ad-hoc (`npm i -D sharp` + script descartável) na sessão que gerou o arquivo, e não há script de geração commitado no repositório.
  - **Para adicionar fotos**: coloque o(s) arquivo(s) na pasta do tema em `public/images/portfolio/<tema>/`, depois regenere `portfolio-data.ts` — reinstale `sharp` temporariamente, leia as dimensões de cada arquivo da pasta e reescreva o array `portfolioCategories` (ou peça para o Claude fazer isso). Não edite as dimensões à mão.
- As duas telas de portfólio ([celebracoes/page.tsx](src/app/celebracoes/page.tsx) e `public/portfolio.html`) consomem esse mesmo conjunto de 110 fotos — mudar as fotos do portfólio afeta as duas.

## Os dois portfólios (e por que ambos existem)

1. **`/celebracoes`** — rota Next normal ([celebracoes/page.tsx](src/app/celebracoes/page.tsx), com [PortfolioHeader.tsx](src/components/sections/PortfolioHeader.tsx) e [PortfolioGallery.tsx](src/components/sections/PortfolioGallery.tsx)). Usa `next/image`, filtro por tema, paginação "Ver mais" (12 fotos por vez) e lightbox. É a versão integrada ao site, navegável pelo menu.
2. **`public/portfolio.html`** — página estática autocontida (CSS e JS inline, um único arquivo de ~800 linhas), com os mesmos temas e as mesmas 110 fotos, mas reimplementados à mão em HTML/CSS/JS puro. Os caminhos de imagem são **relativos** (`images/portfolio/...`, sem barra inicial), então o arquivo funciona sozinho: pode ser enviado por WhatsApp/e-mail como arquivo, aberto localmente, ou hospedado em qualquer lugar (nem precisa do Next) — desde que a pasta `images/` vá junto ao lado dele. É o motivo de existir apesar de duplicar a lógica de `/celebracoes`: serve a um caso de uso que uma rota Next não cobre (arquivo único, sem servidor, sem dependências de build).

Editar um dos dois **não** atualiza o outro automaticamente — são implementações independentes que só compartilham os arquivos de imagem.

## Modo GITHUB_PAGES=1

Existe um segundo canal de publicação, além da Vercel: [.github/workflows/github-pages.yml](.github/workflows/github-pages.yml), publicando em `https://saymonabraao0000-stack.github.io/rosa-buffet/`. Ele roda em todo push para `main` (e manualmente via `workflow_dispatch`).

O modo é ativado **somente** pela env var `GITHUB_PAGES=1`, setada dentro do próprio workflow antes de `npm run build`. Isso é proposital: garante que a Vercel (que não seta essa variável) e `npm run dev` continuem se comportando exatamente como antes, sem nenhum efeito colateral do modo Pages. **Qualquer alteração em [next.config.ts](next.config.ts) precisa preservar essa separação** — nunca torne o comportamento do Pages o padrão.

O que muda quando `GITHUB_PAGES=1`, tudo isolado dentro do `if` em `next.config.ts`:

- `output: "export"` — gera HTML estático em `out/` em vez de build para servidor.
- `basePath` — vem de [base-path.ts](src/lib/base-path.ts): `/rosa-buffet` (nome do repo) no modo Pages, string vazia fora dele. O Next já prefixa sozinho `<Link>` e os assets de build, mas **não** prefixa o que é escrito à mão (ícone do site em `layout.tsx`, `src` de imagem quando o loader está customizado) — por isso o helper `withBasePath()` existe e é usado explicitamente nesses pontos.
- `trailingSlash: true` — cada rota vira uma pasta com `index.html`, formato que o GitHub Pages serve sem tropeço.
- `images.loader` customizado ([pages-image-loader.ts](src/lib/pages-image-loader.ts)) — o otimizador de imagem do Next precisa de servidor, que não existe em export estático. O loader custom serve o arquivo original de `/public` sem redimensionar, só acrescentando o `basePath`. Note que isso **não** é o mesmo que `unoptimized: true`: `unoptimized` ignora o `basePath` e quebraria todas as fotos sob `/rosa-buffet`.
- `robots.ts` e `sitemap.ts` declaram `export const dynamic = "force-static"` — necessário porque essas rotas são geradas dinamicamente por padrão no App Router, o que é incompatível com `output: "export"`.

Estado atual: a etapa de build (`Gerar site estático`, job `build`) passa normalmente. A etapa de deploy (`Publicar`, `actions/deploy-pages@v4`) **falha** com `404 Not Found` / "Ensure GitHub Pages has been enabled", porque **o GitHub Pages do repositório ainda não foi ligado**. Para resolver: em Settings → Pages → Build and deployment → Source, selecionar **GitHub Actions** (hoje está no padrão, sem Pages habilitado — confirmado via `gh api repos/.../pages` retornando 404). Depois disso o workflow já existente deve publicar sem precisar de mais mudança de código.

## Fluxo de publicação

- **Vercel (produção real)**: push em `main` → build automático → publica em produção. Não precisa de passo manual. Previews de outras branches existem mas pedem login Vercel para ver.
- **GitHub Pages (link público alternativo)**: mesmo push em `main` também dispara o workflow acima, mas hoje o deploy final falha até o Pages ser habilitado nas configurações do repo (ver seção anterior).
- Não há passo de deploy manual nem `vercel.json` no repositório — toda configuração de projeto/domínio/env vars da Vercel vive no dashboard, fora do controle de versão.

## Pendências / TODOs em aberto

- **Domínio `www.rosabuffet.com.br` ainda não existe** — não resolve no DNS (`Non-existent domain`, confirmado em 2026-08-25). `siteConfig.url` em [site-config.ts:13](src/lib/site-config.ts#L13) já aponta para ele, e esse valor alimenta `canonical`, `sitemap.ts`, `robots.ts` e as meta tags Open Graph/Twitter em `layout.tsx` — ou seja, hoje o preview de link do WhatsApp/redes sociais aponta para um endereço fora do ar. Trocar `siteConfig.url` assim que o domínio definitivo estiver registrado e resolvendo.
- **GitHub Pages não está ligado** em Settings → Pages → Source (ver seção "Modo GITHUB_PAGES=1" acima). É a única coisa faltando para `https://saymonabraao0000-stack.github.io/rosa-buffet/` funcionar.
- **Depoimentos fictícios**: os 4 depoimentos em [site-data.ts:236-269](src/lib/site-data.ts#L236-L269) (Camila Souza, Rafael Almeida, Juliana Ferreira, Marcos Vinícius) são inventados para preencher o layout — há um TODO explícito no código dizendo para substituí-los por depoimentos reais antes de considerar o site "pronto" com esse conteúdo publicado como se fosse real.
- **Links placeholder em `site-config.ts`**:
  - `social.facebook` ([site-config.ts:41](src/lib/site-config.ts#L41)) tem TODO explícito — aponta para `https://www.facebook.com/`, a home genérica do Facebook, não a página da empresa.
  - `googleMapsUrl`/`googleMapsEmbedUrl` ([site-config.ts:33-36](src/lib/site-config.ts#L33-L36)) **não têm TODO no código**, mas são apenas uma URL de busca do Google Maps montada a partir do endereço em texto (`query=Rua+São+João...`), não um link para uma ficha/perfil real do Google Business da Rosa Buffet. Funciona, mas vale trocar por um link de perfil real quando existir um.
- Vários cards de serviço em [site-data.ts](src/lib/site-data.ts) (festas infantis, eventos corporativos, chá revelação, buffet completo) ainda usam fotos de banco de imagens (Unsplash) como placeholder — cada um tem um TODO próprio no código indicando isso; substituir por fotos reais quando disponíveis, adicionando o arquivo em `public/images/eventos/` e trocando a URL.
