# Supabase Production

Este guia prepara o backend real. Use staging primeiro; produção só deve receber
dados reais depois de validar segurança e permissões.

## Passos

1. Criar projeto Supabase.
2. Copiar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Guardar `SUPABASE_SERVICE_ROLE_KEY` apenas no Vercel.
4. Aplicar migrations:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

5. Carregar seed de teste apenas em staging:

```bash
npx supabase db execute --file supabase/seed/pilot_seed.sql
```

## Tabelas Principais

- `users`
- `donors`
- `hospitals`
- `blood_requests`
- `appointments`
- `notifications`
- `rewards`
- `audit_logs`
- `fraud_reviews`
- `push_tokens`
- `notification_preferences`

## Variáveis Web

```bash
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_PUSH_MODE=expo
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Variáveis Mobile

```bash
EXPO_PUBLIC_AUTH_MODE=supabase
EXPO_PUBLIC_DATA_MODE=supabase
EXPO_PUBLIC_PUSH_MODE=expo
EXPO_PUBLIC_API_URL=https://doesangue.ao
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Segurança

- Confirmar RLS em todas as tabelas.
- Admin pode ver dados nacionais.
- Hospital só pode ver dados do próprio hospital.
- Dador só pode ver o próprio perfil, pedidos compatíveis e notificações.
- Nunca expor a service role key no Expo.

## Teste Obrigatório

1. Hospital cria pedido.
2. Admin vê pedido.
3. Dador compatível vê pedido.
4. Dador aceita.
5. PIN é gerado.
6. Hospital valida PIN.
7. Pedido conclui.
8. Recompensas, notificações e auditoria ficam gravadas.
