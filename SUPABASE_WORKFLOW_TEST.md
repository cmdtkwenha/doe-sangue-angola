# Supabase Workflow Test

Data: 19 Maio 2026

## Estado do Ambiente Local

O teste de base de dados real não pôde ser executado neste workspace porque as variáveis Supabase não estão definidas localmente:

- `NEXT_PUBLIC_AUTH_MODE`: em falta
- `NEXT_PUBLIC_DATA_MODE`: em falta
- `NEXT_PUBLIC_SUPABASE_URL`: em falta
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: em falta
- `SUPABASE_SERVICE_ROLE_KEY`: em falta

Para testar contra Supabase real, configurar:

```env
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` é necessário no servidor Vercel para as rotas API gravarem pedidos, agendamentos, notificações, recompensas e auditoria com RLS ativo.

## Verificação Técnica Executada

| Passo | Resultado |
| --- | --- |
| Admin login e `/admin` | Código usa Supabase Auth e role `admin`; teste live bloqueado por env local |
| Hospital login e `/hospital` | Código usa Supabase Auth e role `hospital`; teste live bloqueado por env local |
| Dador login e `/mobile` | Código usa Supabase Auth e role `donor`; teste live bloqueado por env local |
| Hospital cria pedido | Rota `/api/blood-requests` chama `supabaseProvider.createRequest` |
| Pedido salvo | Repositório grava em `blood_requests` |
| Admin vê pedido | Admin lê `/api/blood-requests` |
| Dador compatível vê pedido | `/api/blood-requests?donorId=...` filtra por `matchingAgent` |
| Dador aceita | `/api/appointments/accept` cria ou reutiliza agendamento |
| PIN de 4 dígitos | `schedulingAgent` gera PIN e repositório salva em `appointments` |
| Hospital valida PIN | `/api/appointments/validate-pin` valida por PIN e `requestId` |
| Pedido concluído | `/api/appointments/complete` atualiza pedido para `Concluído` |
| Recompensas | `donorRepository.addRewardPoints` atualiza pontos e cria `rewards` |
| Auditoria | `auditRepository.createAuditLog` registra ações principais |

## Comandos Executados

- `npm run check:lines`
- `npm run typecheck`
- `npm run build`

Todos passaram após os ajustes.

## Teste Live Pendente

Depois de configurar as variáveis acima em Vercel/local:

1. Entrar como `hospital@sangueangola.ao`.
2. Criar pedido urgente O-.
3. Entrar como `admin@sangueangola.ao` e confirmar o pedido em `/admin`.
4. Entrar como `donor@sangueangola.ao` e aceitar o pedido em `/mobile`.
5. Confirmar que `/hospital` mostra o dador com PIN.
6. Validar o PIN no hospital.
7. Concluir a doação.
8. Confirmar atualização de `blood_requests`, `appointments`, `rewards`, `notifications` e `audit_logs`.
