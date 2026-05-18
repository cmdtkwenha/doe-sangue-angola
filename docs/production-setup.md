# Production Setup

Este checklist liga a plataforma real sem remover o modo mock.

## 1. Supabase

```bash
npx supabase login
npx supabase link --project-ref seu-project-ref
npx supabase db push
```

Depois aplique seed de desenvolvimento apenas em staging:

```bash
npx supabase db execute --file supabase/seed/development_seed.sql
```

## 2. Vercel

Configure:

```bash
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_PUSH_MODE=expo
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Build command:

```bash
npm run build:web
```

## 3. Mobile

Configure no EAS:

```bash
EXPO_PUBLIC_AUTH_MODE=supabase
EXPO_PUBLIC_DATA_MODE=supabase
EXPO_PUBLIC_PUSH_MODE=expo
EXPO_PUBLIC_API_URL=https://seu-dominio
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## 4. Health Check

Depois do deploy, abra:

```text
/api/health
```

Confirme:

- `dataMode` é `supabase`
- `dataReady` é `true`
- `database.ok` é `true`

## 5. Workflow Crítico

1. Admin entra em `/admin`.
2. Hospital entra em `/hospital`.
3. Hospital cria pedido urgente.
4. Admin vê pedido.
5. Dador vê pedido compatível.
6. Dador aceita.
7. Hospital valida PIN.
8. Pedido conclui.
9. Recompensas, notificações e auditoria ficam persistidas.

## Fallback

Se produção falhar, troque temporariamente:

```bash
NEXT_PUBLIC_DATA_MODE=mock
NEXT_PUBLIC_AUTH_MODE=mock
```

Isto preserva a demo enquanto Supabase é corrigido.
