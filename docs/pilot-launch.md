# Lançamento Piloto

Este guia prepara um teste real pequeno com 1 hospital e 20 dadores em Luanda.

## 1. Contas Necessárias

- Vercel: conta ligada ao repositório GitHub.
- Supabase: projeto criado para staging/piloto.
- Expo/EAS: conta Expo com permissões para criar builds Android.

## 2. Variáveis Do Piloto

Use `env/pilot.env.example` como base.

Valores obrigatórios:

- `NEXT_PUBLIC_AUTH_MODE=supabase`
- `NEXT_PUBLIC_DATA_MODE=supabase`
- `NEXT_PUBLIC_PUSH_MODE=expo`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 3. Supabase

1. Criar projeto Supabase.
2. Aplicar as migrations:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_push_notifications.sql`
3. Aplicar seed do piloto:
   - `supabase/seed/pilot_seed.sql`
4. Criar utilizadores em Supabase Auth:
   - `admin.piloto@sangueangola.ao`
   - `hospital.piloto@sangueangola.ao`
   - `dador01@sangueangola.ao` até `dador20@sangueangola.ao`
5. Copiar os `auth_user_id` para a tabela `users` se o login real exigir vínculo direto.

## 4. Vercel

1. Importar o projeto no Vercel.
2. Root directory: `apps/web`.
3. Build command: `cd ../.. && npm run build:web`.
4. Output: Next.js automático.
5. Adicionar variáveis do ficheiro `env/pilot.env.example`.
6. Fazer deploy para URL de staging.

## 5. Android EAS

1. Entrar na conta Expo.
2. Definir secrets do EAS com as variáveis `EXPO_PUBLIC_*`.
3. Criar build:
   - `cd apps/mobile`
   - `eas build --platform android --profile pilot`
4. Distribuir o APK internamente para os 20 dadores.

## 6. Teste Piloto

Validar com o hospital:

- Login do hospital.
- Criar pedido urgente O-.
- Confirmar pedido no Admin.
- Confirmar pedido no app dador.
- Dador aceita.
- PIN aparece no hospital.
- Hospital valida PIN.
- Hospital conclui doação.
- Pontos e logs aparecem.
- Notificação fica registada.

## 7. Critério Para Abrir Ao Público

Só avançar quando:

- 20 dadores conseguem entrar.
- Pelo menos 3 dadores recebem pedido.
- Pelo menos 1 fluxo completo é concluído sem intervenção técnica.
- Não existem erros críticos no Vercel, Supabase ou EAS.
- O hospital confirma que o fluxo operacional é claro.
