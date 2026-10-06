# Calendário de posts da Rosa Buffet (outubro a dezembro de 2026)

26 posts prontos: 6 do lote 1 + 20 do lote 2. Quatro por semana (seg, qua, sex, sáb), alternando carrossel e post único e misturando os tipos de festa.
Cada pasta tem `instagram/slide-NN.png` (as imagens pra subir, na ordem) e `legenda.md` (a legenda pronta).
`grade-do-feed.png` mostra como o perfil fica com todos postados.

| # | Data | Pasta | Imagens |
|---|---|---|---|
| 1 | 07/10 (qua) | `carrossel-tudo-num-pacote/` | 7 |
| 2 | 09/10 (sex) | `post-google/` | 1 |
| 3 | 10/10 (sáb) | `carrossel-temas-infantis/` | 7 |
| 4 | 12/10 (seg) | `post-dia-das-criancas/` | 1 |
| 5 | 14/10 (qua) | `carrossel-pacotes/` | 6 |
| 6 | 16/10 (sex) | `post-depoimento-a/` | 1 |
| 7 | 17/10 (sáb) | `carrossel-casamento/` | 6 |
| 8 | 19/10 (seg) | `post-simulador/` | 1 |
| 9 | 21/10 (qua) | `carrossel-festa-infantil/` | 6 |
| 10 | 23/10 (sex) | `post-frase-casamento/` | 1 |
| 11 | 24/10 (sáb) | `carrossel-depoimentos/` | 7 |
| 12 | 26/10 (seg) | `post-visita/` | 1 |
| 13 | 28/10 (qua) | `carrossel-perguntas-frequentes/` | 6 |
| 14 | 30/10 (sex) | `post-temas-15-anos/` | 1 |
| 15 | 31/10 (sáb) | `carrossel-15-anos/` | 6 |
| 16 | 02/11 (seg) | `post-primeiro-aninho/` | 1 |
| 17 | 04/11 (qua) | `carrossel-nosso-salao/` | 6 |
| 18 | 06/11 (sex) | `post-depoimento-b/` | 1 |
| 19 | 07/11 (sáb) | `carrossel-formatura-abc/` | 6 |
| 20 | 09/11 (seg) | `post-datas-2027/` | 1 |
| 21 | 11/11 (qua) | `carrossel-como-reservar/` | 7 |
| 22 | 13/11 (sex) | `post-aniversario-adulto/` | 1 |
| 23 | 14/11 (sáb) | `carrossel-checklist-festa-infantil/` | 7 |
| 24 | 16/11 (seg) | `carrossel-detalhes/` | 6 |
| 25 | 18/11 (qua) | `carrossel-diversao/` | 6 |
| 26 | entre 20 e 25/12 | `post-boas-festas/` | 1 |

## Imagens a gerar no ChatGPT (prompts no `prompts.md` de cada pasta)
- `carrossel-diversao/img-cabine-360.png`, `img-tunel-led.png`, `img-playground.png` (post de 18/11)
- `carrossel-15-anos/img-cabine-360.png` (post de 31/10). Pode ser a mesma imagem da cabine 360 do carrossel-diversao, copiada para as duas pastas
- Depois de salvar: `python render.py <pasta>` dentro desta pasta. A moldura tracejada some sozinha.

## Para conferir com a Rosa antes de postar
- Nota do Google (4,6 · 266 avaliações), conferida em 24/09. Aparece em post-google, post-depoimento-a, carrossel-depoimentos e no print do simulador
- Horário de visitas "terça a sábado, das 9h às 17h" (é o padrão configurado no CRM). Aparece em post-visita, carrossel-como-reservar e carrossel-perguntas-frequentes
- Nomes dos temas infantis (Safári, Fundo do mar…) e de 15 anos (Azul gelo, Lilás e dourado…) foram dados olhando as fotos
- Nenhum post tem valor ou preço (pedido da Rosa). Nomes de clientes e de crianças estão desfocados

## Regras e ferramentas
- Regras do lote: `BRIEFING-LOTE-2.md`. Base visual: `rosa.css`. Render: `python render.py <pasta>` ou `python render.py todos`
