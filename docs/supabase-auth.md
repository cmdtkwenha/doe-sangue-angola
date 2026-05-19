# Supabase Auth

Este guia explica como o login real funciona em produção.

## Variáveis

```bash
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

No mobile, use apenas variáveis `EXPO_PUBLIC_*`. Nunca coloque
`SUPABASE_SERVICE_ROLE_KEY` no Expo.

## Fluxo de Login

1. Utilizador entra em `/auth`.
2. `LoginForm` envia email e palavra-passe.
3. Supabase Auth valida a sessão.
4. A app lê o perfil em `public.users`.
5. O campo `role` decide o destino:
   - `admin` vai para `/admin`
   - `hospital` vai para `/hospital`
   - `donor` vai para `/mobile`

## Signup

O registo usa Supabase Auth e depois cria o perfil em `public.users` via
`authRepository.upsertProfile`.

Campos guardados:

- `auth_user_id`
- `email`
- `name`
- `role`
- `phone`

## Password Reset

`/auth/forgot-password` chama `resetPasswordForEmail`. O email é enviado pelo
Supabase. Configure o domínio final nas opções de Auth do painel Supabase.

## Seed Users

Primeiro crie os utilizadores em Supabase Auth:

1. Abra Supabase Dashboard.
2. Vá a Authentication > Users.
3. Clique em Add user.
4. Crie estes emails com uma palavra-passe temporária segura:

- `admin@sangueangola.ao`
- `hospital@sangueangola.ao`
- `donor@sangueangola.ao`

Depois aplique o SQL de perfis:

```bash
npx supabase db execute --file supabase/seed/auth_onboarding_profiles.sql
```

Este seed liga `public.users.auth_user_id` aos IDs reais de `auth.users`.

Também existe seed local para desenvolvimento:

```bash
npx supabase db execute --file supabase/seed/development_seed.sql
```

Esse seed cria perfis base:

- `admin@sangueangola.ao`
- `hospital@sangueangola.ao`
- `donor@sangueangola.ao`

## Fallback Seguro

Se `NEXT_PUBLIC_AUTH_MODE=mock`, a app não exige Supabase. Use este modo apenas
para demo ou recuperação temporária.
