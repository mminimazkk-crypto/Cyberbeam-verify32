# Cyber Beam

Site compacto de verificação via Discord OAuth2, pronto para hospedar na Netlify.

## Netlify

- Publish directory: `public`
- Functions directory: `netlify/functions`
- Build command: `echo 'Cyber Beam static site: no build step required'`
- O `netlify.toml` já contém essa configuração e evita que a Netlify tente compilar o workspace inteiro.
- Cadastre as variáveis do `.env.example` no painel da Netlify.
- No Discord Developer Portal, use exatamente:
  `https://SEU-DOMINIO/.netlify/functions/callback`
  como Redirect URI.

O bot precisa estar no servidor, ter a permissão **Manage Roles** e ficar acima
do cargo configurado em `ROLE_ID`.

## Arquivos

- `public/index.html` — interface Cyber Beam
- `public/cyber-beam.gif` — GIF enviado pelo projeto
- `netlify/functions/login.ts` — início do OAuth2
- `netlify/functions/callback.ts` — troca do token, entrada no servidor e atribuição do cargo