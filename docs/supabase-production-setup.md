# Supabase Production Setup

Este guia liga Doe Sangue Angola ao Supabase real sem perder o modo mock.

## Modos de Dados

- `NEXT_PUBLIC_DATA_MODE=mock`: usa dados locais e mantém a demo Vercel segura.
- `NEXT_PUBLIC_DATA_MODE=supabase`: usa repositórios Supabase quando as chaves existem.

Se as chaves faltarem, a app mostra erro amigável e o modo mock continua a ser o
caminho seguro para demonstrações.

## Variáveis Web

```bash
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_PUSH_MODE=expo
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` no Expo.

## Aplicar Schema

```bash
npx supabase login
npx supabase link --project-ref seu-project-ref
npx supabase db push
```

As migrations criam:

- `users`
- `donors`
- `hospitals`
- `blood_requests`
- `appointments`
- `notifications`
- `rewards`
- `audit_logs`

Também existem tabelas preparadas para fraude, push e preferências.

## Seed de Desenvolvimento

Para um ambiente de teste:

```bash
npx supabase db execute --file supabase/seed/development_seed.sql
```

Contas de referência:

- `admin@sangueangola.ao`
- `hospital@sangueangola.ao`
- `donor@sangueangola.ao`

## RLS

As políticas protegem:

- Admin: leitura nacional e auditoria.
- Hospital: dados do próprio hospital.
- Dador: perfil, appointments e notificações próprias.

Use `docs/security-audit.md` antes de abrir acesso público.

## Health Check

Depois do deploy, abra:

```text
/api/health
```

Resultado esperado em Supabase:

- `dataMode: "supabase"`
- `dataReady: true`
- `database.ok: true`

Se `database.ok` for falso, volte temporariamente para:

```bash
NEXT_PUBLIC_DATA_MODE=mock
```

## Workflow Crítico

1. Hospital cria pedido urgente.
2. Pedido entra em `blood_requests`.
3. Matching lê `donors`.
4. Notificações entram em `notifications`.
5. Dador aceita e cria `appointments`.
6. PIN é validado.
7. Pedido fica concluído.
8. `rewards` e `audit_logs` são gravados.
