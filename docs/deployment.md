# Deployment

Este é o guia principal para colocar Doe Sangue Angola online sem mudar o
produto. O deploy tem três partes: Web no Vercel, backend no Supabase e app
mobile no Expo EAS.

## Ambientes

- Desenvolvimento: usa mock por defeito e roda no computador local.
- Staging: usa Supabase de teste para ensaiar com uma equipa pequena.
- Produção: usa Supabase real, autenticação real e push Expo.

## Ordem Recomendada

1. Criar projeto Supabase e aplicar migrations.
2. Criar projeto Vercel e configurar variáveis.
3. Fazer deploy web e testar `/auth`, `/admin`, `/hospital` e `/mobile`.
4. Configurar EAS e gerar build Android de desenvolvimento.
5. Testar fluxo completo com uma clínica e dadores internos.
6. Só depois gerar build de produção.

## Variáveis

Use estes ficheiros como modelos:

- `.env.development.example`
- `.env.staging.example`
- `.env.production.example`
- `env/vercel.production.example`
- `env/eas.production.example`

Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` no mobile.

## Comandos Antes do Deploy

```bash
npm run check:lines
npm run test
npm run smoke
npm run typecheck
npm run build
```

## Guias Detalhados

- Web: `docs/vercel-deploy.md`
- Supabase: `docs/supabase-production.md`
- Mobile: `docs/mobile-build.md`
- Checklist final: `docs/production-checklist.md`
