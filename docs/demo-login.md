# Demo Login

Use este guia quando a plataforma estiver em modo demo/mock, incluindo Vercel.

## Variáveis

No Vercel, defina:

```bash
NEXT_PUBLIC_AUTH_MODE=mock
NEXT_PUBLIC_DATA_MODE=mock
NEXT_PUBLIC_PUSH_MODE=mock
```

`NEXT_PUBLIC_AUTH_MODE=mock` não exige Supabase. A app usa as contas demo
locais e redireciona cada perfil para o portal correto.

## Contas Demo

| Perfil | Email | Destino |
| --- | --- | --- |
| Admin | `admin@sangueangola.ao` | `/admin` |
| Hospital | `hospital@sangueangola.ao` | `/hospital` |
| Dador | `donor@sangueangola.ao` | `/mobile` |

## Palavra-passe

Use uma destas palavras-passe:

- `Demo@2026`
- `demo@2026`

## Teste Rápido

1. Abrir `/auth`.
2. Escolher uma conta demo visível na página.
3. Entrar com `demo@2026`.
4. Confirmar o redirecionamento para o portal certo.

## Quando Usar Supabase

Troque para `NEXT_PUBLIC_AUTH_MODE=supabase` apenas quando as chaves Supabase,
tabelas, RLS e utilizadores reais estiverem prontos.
