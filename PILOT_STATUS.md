# Estado Do Piloto

## Preparado Localmente

- Configuração piloto com Supabase e Expo Push.
- Perfil EAS `pilot` para APK interno.
- Seed SQL com 1 hospital verificado em Luanda.
- Seed SQL com 20 dadores de teste.
- Fluxo real de pedidos ligado a Supabase via repositórios.
- Checks locais passaram: linhas, lint, build e smoke routes.

## Bloqueado Até Haver Credenciais

- Deploy real no Vercel.
- Aplicação das migrations no Supabase remoto.
- Criação real de utilizadores em Supabase Auth.
- Build Android remoto no EAS.
- Vercel CLI abriu login por dispositivo, mas não havia sessão autenticada.
- Supabase CLI está disponível, mas falta `SUPABASE_ACCESS_TOKEN`.
- EAS está autenticado como `kwenha`, mas não há variáveis remotas configuradas.

## Contas De Teste Planeadas

- `admin.piloto@sangueangola.ao`
- `hospital.piloto@sangueangola.ao`
- `dador01@sangueangola.ao` até `dador20@sangueangola.ao`

## Próximo Passo

Fornecer acesso autenticado ou executar os comandos de deploy com:

- Vercel CLI autenticado.
- Supabase CLI autenticado e projeto ligado.
- EAS CLI autenticado.

## Comandos De Lançamento

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase db execute --file supabase/seed/pilot_seed.sql
npx vercel --prod
cd apps/mobile && eas build --platform android --profile pilot
```
