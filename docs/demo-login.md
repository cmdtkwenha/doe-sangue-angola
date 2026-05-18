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

| Perfil | Email | Palavra-passe | Destino |
| --- | --- | --- | --- |
| Admin | `admin@sangueangola.ao` | `demo@2026` | `/admin` |
| Hospital | `hospital@sangueangola.ao` | `demo@2026` | `/hospital` |
| Dador | `donor@sangueangola.ao` | `demo@2026` | `/mobile` |

## Palavra-passe

Use `demo@2026`. A palavra-passe antiga `Demo@2026` continua aceite como
fallback para apresentações antigas.

- `demo@2026`
- `Demo@2026`

## Teste Rápido

1. Abrir `/auth`.
2. Escolher uma conta demo visível na página.
3. Entrar com `demo@2026`.
4. Confirmar o redirecionamento para o portal certo.

## Quando Usar Supabase

Troque para `NEXT_PUBLIC_AUTH_MODE=supabase` apenas quando as chaves Supabase,
tabelas, RLS e utilizadores reais estiverem prontos.
