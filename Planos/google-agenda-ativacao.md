# Ativar o Google Agenda no CRM da Rosa Buffet

Guia para o Saymon ativar a integração do item 14 (`Planos/crm-melhorias-2026-09-24.md`).
O código já está pronto e "dormente" — não faz nada até essas credenciais existirem.

## O que essa integração faz

Toda vez que uma festa é marcada como **fechada** (com data definida), o CRM cria
automaticamente um evento de dia inteiro na agenda do Google conectada, com o nome do
cliente, o tema, o telefone, o número de convidados, o pacote e um link direto para a
ficha do lead no CRM. Se a festa deixar de estar fechada, ou perder a data, o evento é
apagado. Também existe um botão "Sincronizar agora" em Configurações para forçar isso
em todas as festas fechadas de uma vez.

## Passo a passo no Google Cloud Console

1. Acesse **console.cloud.google.com** com a conta Google que vai ficar responsável pela
   agenda (pode ser a mesma conta que a Rosilene vai usar depois, ou uma sua — quem
   clicar em "Conectar Google Agenda" lá no CRM é quem empresta a agenda).
2. Crie um projeto novo (ex.: "Rosa Buffet CRM").
3. Menu lateral → **APIs e serviços → Biblioteca** → procure **Google Calendar API** →
   clique em **Ativar**.
4. Menu lateral → **APIs e serviços → Tela de consentimento OAuth**:
   - Tipo de usuário: **Externo**.
   - Preencha nome do app ("Rosa Buffet CRM"), e-mail de suporte e e-mail de contato do
     desenvolvedor (pode ser o seu).
   - Em **Escopos**, não precisa adicionar nada manualmente aqui — o app já pede na hora
     de conectar (`calendar.events`, `openid`, `email`). O Google vai marcar
     `calendar.events` como escopo **sensível** (não é o nível mais alto, "restrito", mas
     pede mais cuidado): na prática isso significa que, enquanto o app estiver em modo
     **Testing** (o padrão), só as contas que você cadastrar como "usuários de teste"
     conseguem conectar — qualquer outra pessoa vê uma tela de aviso do Google e não
     consegue prosseguir.
   - Em **Usuários de teste**, adicione o e-mail que vai clicar em "Conectar" (o da
     Rosilene, `rosabuffet26@gmail.com`, ou o seu — o que for usar a agenda de verdade).
   - **Recomendo publicar o app** (botão "Publicar aplicativo" na tela de consentimento)
     assim que os testes derem certo. Motivo: um app em modo "Testing" faz o Google
     **expirar o refresh token em 7 dias** — passado esse prazo, a conexão para de
     funcionar sozinha e alguém precisa clicar em "Conectar" de novo. Publicando (mesmo
     sem passar pela verificação completa do Google, que só é obrigatória para apps com
     muitos usuários ou escopos "restritos"), o token deixa de expirar por tempo.
     Para o escopo `calendar.events`, publicar sem a verificação completa é permitido
     — o Google só mostra uma tela de aviso extra ("app não verificado") para o usuário
     antes de conectar, o que não é problema para uso interno com poucas pessoas.
5. Menu lateral → **APIs e serviços → Credenciais** → **Criar credenciais → ID do cliente
   OAuth**:
   - Tipo de aplicativo: **Aplicativo da Web**.
   - Nome: "Rosa Buffet CRM".
   - Em **URIs de redirecionamento autorizados**, adicione as duas:
     - `https://rosabuffeteventos.com.br/crm/google/callback`
     - `https://rosa-buffet.saymonabraao0000.workers.dev/crm/google/callback`
   - Clique em **Criar**. O Google mostra um **ID do cliente** e uma **Chave secreta do
     cliente** — copie os dois, você vai usar no próximo passo.

## Cadastrar as credenciais no Worker (Cloudflare)

As credenciais são **Secrets** do Worker `rosa-buffet` (nunca vão para o código nem para
o git). Pelo painel da Cloudflare:

1. **Cloudflare Dashboard → Workers & Pages → rosa-buffet → Settings → Variables and
   Secrets**.
2. Adicione duas variáveis do tipo **Secret**:
   - `GOOGLE_CLIENT_ID` = o ID do cliente copiado acima.
   - `GOOGLE_CLIENT_SECRET` = a chave secreta copiada acima.
3. Salve. Isso já é suficiente para o botão em Configurações trocar de "Aguardando
   configuração técnica" para "Conectar Google Agenda" — não precisa de novo deploy,
   Secrets ficam disponíveis na próxima execução do Worker.

Ou, via linha de comando (se preferir), na pasta do projeto:

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

(cada comando pede o valor interativamente e não grava em nenhum arquivo do repositório).

## Conectar

1. Entre no CRM (`/crm`) → **Configurações** → seção **Google Agenda**.
2. Clique em **Conectar Google Agenda**.
3. Faça login com a conta Google cadastrada como usuário de teste (ou qualquer conta,
   se o app já estiver publicado) e aceite as permissões pedidas — o Google vai avisar
   que o app "não foi verificado pelo Google" se ainda estiver em modo Testing; isso é
   esperado, clique em "Avançado" → "Acessar Rosa Buffet CRM (não seguro)" para
   continuar.
4. Você volta para Configurações com a mensagem "Google Agenda conectado com sucesso." e
   passa a ver "Conectado como [e-mail] desde [data]", com os botões **Sincronizar
   agora** e **Desconectar**.
5. Clique em **Sincronizar agora** uma vez para criar os eventos das festas fechadas que
   já existirem no CRM antes da conexão.

## O que significa dar essa permissão (em linguagem simples)

O escopo pedido é `calendar.events` — o app só pode **criar, editar e apagar eventos**
na agenda escolhida. Ele **não pode**:
- ler outras agendas da conta além da escolhida (o CRM sempre usa a agenda "primary",
  a principal da conta que conectou);
- ver e-mails, arquivos do Drive, contatos ou qualquer outro dado do Google;
- fazer nada além de mexer nos eventos daquela agenda.

O escopo `openid`/`email` serve só para o CRM mostrar de qual conta Google ele está
"pegando emprestada" a agenda (aparece como "Conectado como fulano@gmail.com"), sem
acesso a mais nada da conta.

Se algum dia quiser revogar o acesso manualmente (sem passar pelo botão "Desconectar"
do CRM): **myaccount.google.com/permissions** → procure "Rosa Buffet CRM" → Remover
acesso.

## Se algo der errado

- Botão continua em "Aguardando configuração técnica" mesmo depois de cadastrar os
  Secrets → confirme que os nomes são exatamente `GOOGLE_CLIENT_ID` e
  `GOOGLE_CLIENT_SECRET` e que foram salvos no Worker `rosa-buffet` (não em outro
  projeto).
- Erro de "redirect_uri_mismatch" na tela do Google → a URI de redirecionamento
  cadastrada no passo 5 do Google Cloud não bate com o domínio de onde você clicou em
  "Conectar" (confira se tem as duas URIs, com e sem o `www` não importa pois o CRM usa
  a raiz do domínio).
- Depois de ~7 dias a conexão "cai" sozinha (token expirado) → o app ainda está em modo
  "Testing" no Google Cloud — volte na Tela de consentimento OAuth e publique o app
  (ver passo 4 acima), depois clique em "Conectar" de novo em Configurações.
- Uma falha do Google nunca impede salvar uma alteração no CRM: se der erro na hora de
  sincronizar, o lead é salvo normalmente e o evento simplesmente não é criado/atualizado
  naquela vez (dá para tentar de novo depois com "Sincronizar agora").
