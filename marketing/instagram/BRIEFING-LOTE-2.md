# Briefing — lote 2 de posts da Rosa Buffet (06/10/2026)

Cliente: **Rosa Buffet & Eventos**, buffet com salão próprio em Manaus (Rua São João, 310 · Cidade de Deus).
Instagram: `@rosabuffetoficial_`. Site: `rosabuffeteventos.com.br` (simulador em /orcamento, visita em /visita).
Raiz desta pasta: `negocios/ervexa/clientes/rosa-buffet/marketing/instagram/`.

## Leia antes de começar
1. `rosa.css` (classes prontas) e `render.py` (como renderiza e o que confere).
2. Posts do lote 1, que são o padrão de qualidade: `carrossel-tudo-num-pacote/`, `carrossel-festa-infantil/`, `carrossel-pacotes/`, `post-simulador/`, `post-google/`, `post-visita/` (cada um tem `carrossel.html`, `legenda.md` e `instagram/slide-NN.png`; olhe os PNGs).
3. Fatos do negócio (só use o que está aqui, nada inventado): `../../src/lib/site-data.ts`, `../../src/lib/quiz-data.ts` (só os textos de `highlights` e `tagline`, **nunca os preços**), `../../src/lib/festas-data.ts`, `../../src/lib/site-config.ts`, e o `../../CLAUDE.md` do site.

## Regras que não podem quebrar
- **NUNCA valores ou preços.** Nem de pacote, nem o sinal, nem "a partir de". Falar que o simulador dá uma "estimativa" pode.
- **Festas que o salão faz:** casamento, 15 anos, infantil, formatura (formatura do ABC, de criança) e aniversário. **Não faz** evento corporativo nem chá revelação: não citar.
- Nada de número inventado ("+1000 festas", "98% satisfeitos"). O único número de prova é **4,6 no Google com 266 avaliações**.
- Todo CTA leva os **dois WhatsApps**: Rosa (92) 99207-3047 e Wellington (92) 99459-8954 (bloco `.contatos` como no lote 1).
- Português do Brasil, simples e caloroso, "a gente" no lugar de "nós". Sem emoji nos slides nem na legenda. Sem jargão de marketing.
- **Privacidade:** nome de criança escrito em objeto (lembrancinha, painel, bolo) e nome, foto de perfil ou telefone de cliente em print de depoimento → desfocar com Pillow e salvar a imagem tratada na pasta do post (ex.: `carrossel-festa-infantil/foto-lembrancinhas.jpg`, desfoque com máscara suave). Rosto em foto do portfólio pode (já está público no site).

## Visual
- Slide 540×675 de CSS (vira PNG 1080×1350). Use as classes de `rosa.css`: `.slide`, `.slide--creme`, `.foto--cheia`, `.foto--topo`, `.moldura`, `.topo`/`.logo`/`.pagina`, `.miolo`/`.miolo--centro`, `.titulo`/`.titulo--g` (com `<em>` dourado em itálico), `.texto`, `.filete`, `.lista`/`.lista--justa`, `.botao`, `.contatos`/`.contato`, `.logo-grande`, `.rodape`.
- Ajuste que é só de um post vai no `<style>` do próprio HTML. **Não edite `rosa.css`, `render.py` nem pastas que não são suas.**
- Fotos: só reais, de `../../../public/images/` (portfolio/{casamentos,quinze-anos,infantil,formaturas,aniversarios}, eventos/, depoimentos/). Prefira as de 1280 px ou mais; as de 640 px (ex.: casamentos-28/29) só em moldura ou meia tela. Não repita a mesma foto que já está em outro post do lote 1 sem motivo.
- Carrossel: 5 a 7 slides. Capa com foto cheia e título grande; slides internos variando layout (foto no topo, creme com moldura, foto meia tela, lista); nunca o mesmo layout em dois slides seguidos; pelo menos 1 slide creme; último slide = CTA com `.logo-grande`, botão do site e `.contatos`. Indicador `01 / 06` no `.pagina`. Rodapé `@rosabuffetoficial_` + `Manaus · AM` (na capa, `arrasta →`).
- Post único: 1 slide, sem indicador de página.

## Imagem que não existe no portfólio → placeholder do ChatGPT
Não há foto de cabine 360, túnel fotográfico, playground, sala de jogos, pista de LED, comida de perto, equipe, DJ. Nesses casos:
```html
<div class="moldura placeholder" style="position:absolute; left:40px; right:40px; top:84px; height:300px; background-image:url(img-cabine-360.png)"><span>Imagem a gerar no ChatGPT:<br>cabine fotográfica 360 (img-cabine-360.png)</span></div>
```
(também vale `class="foto foto--cheia placeholder"`). Escreva `prompts.md` na pasta do post com um prompt **em inglês** por imagem e o nome do arquivo a salvar. Sempre: fotografia realista de festa elegante em salão (dourado, creme, lustres, flores), luz quente, **sem rosto identificável, sem texto, sem logo**, e o formato (`Vertical 4:5`, `Square 1:1` ou `Horizontal 3:2`, conforme a moldura). O `render.py` avisa "placeholder sem imagem ainda" (aviso, não erro). Quando o Saymon salvar a imagem com o nome certo, é só renderizar de novo.

## Como fechar cada post
1. `python render.py <pasta>` (rode dentro da pasta `instagram/`) até sair **sem nenhum erro**.
2. **Abra e olhe cada PNG** (`instagram/slide-NN.png`) com a ferramenta Read. O render não pega tudo: texto ilegível em cima de foto clara, logo sumindo, palavra sozinha na última linha, vão vazio grande, texto encostado na borda, rosto cortado no meio. Corrija e renderize de novo.
3. `legenda.md`: gancho (pergunta ou frase forte) → 1 a 3 frases de contexto → "Arrasta pro lado e confere" (se for carrossel) → bloco de contato (site com "link na bio", os dois WhatsApps, endereço) → 10 a 15 hashtags (marca, nicho e local, ex. `#rosabuffet #buffetmanaus #festasmanaus #manaus`). Sem emoji, sem preço.
4. Não faça commit nem mexa no git.

## Entrega (no fim, responda com)
Pasta de cada post, número de slides, quais imagens ficaram como placeholder (com o nome do arquivo) e qualquer dúvida ou fato que você não conseguiu confirmar.
