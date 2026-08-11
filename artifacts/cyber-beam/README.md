# Cyber Beam

Gateway compacto de acesso privado via Discord OAuth2, preparado para Netlify.

## Publicação na Netlify

1. Configure o diretório base do site como `artifacts/cyber-beam`.
2. Use `public` como diretório de publicação.
3. O arquivo `netlify.toml` já aponta `netlify/functions` como diretório das funções.
4. Cadastre as variáveis do `.env.example` no painel da Netlify.
5. No Discord Developer Portal, adicione exatamente:
   `https://SEU-DOMINIO/.netlify/functions/callback`
   como Redirect URI.

O login solicita `identify` e `guilds.join`. No callback, o projeto troca o código OAuth2,
entra o usuário no servidor (`GUILD_ID`) quando necessário e aplica o cargo (`ROLE_ID`).
O bot precisa estar no servidor e ter permissão **Manage Roles**, com o cargo do bot acima
do cargo que será atribuído.

## Estrutura

- `public/index.html` — versão estática compacta do gateway.
- `public/cyber-beam.gif` — animação monocromática usada no card.
- `netlify/functions/login.ts` — inicia OAuth2 com state assinado.
- `netlify/functions/callback.ts` — valida state, troca token e atribui cargo.
- `netlify.toml` — publicação e roteamento Netlify.
- `src/` — versão React/Vite usada no preview do projeto.