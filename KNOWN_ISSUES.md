# Problemas Conhecidos — Doe Sangue Angola

Data: 28 Maio 2026

## Bloqueadores

Nenhum bloqueador automatizado encontrado após as correções desta QA.

## Avisos Não Bloqueantes

### Possíveis ficheiros sem uso

O audit report sinaliza três ficheiros como possivelmente sem uso:

- `apps/web/app/components/demo/DemoTimeline.tsx`
- `apps/web/app/components/notifications/ReminderPanel.tsx`
- `apps/web/app/components/workflow/DonorAcceptanceFlow.tsx`

Decisão: não removidos nesta ronda porque o pedido foi não adicionar funcionalidades e corrigir apenas bugs críticos. Devem ser revistos numa limpeza posterior.

### Validação real Supabase

Os testes automatizados validam a arquitetura e o fluxo mock. Para produção/piloto, confirmar manualmente:

- `supabase db push` aplicado sem erros.
- RLS ativo e políticas corretas.
- Tabelas `users`, `profiles`, `donors`, `hospitals`, `blood_requests`, `donor_responses`, `notifications`, `audit_logs` disponíveis.
- 25 hospitais importados visíveis em `/admin/hospitals`.

### Push notifications

Expo Push real precisa de development build ou production build. No Expo Go, notificações push remotas não devem ser usadas.

### Teste visual completo

A build e os testes cobrem rotas e tipos, mas a revisão visual final deve ser feita em browser/dispositivo para:

- Botões críticos.
- Modais de confirmação.
- Estados vazios.
- Estados de erro.
- Tabelas em mobile.
- PIN visível no telemóvel.

## Riscos de Piloto

- Contas Supabase sem perfil podem cair em onboarding, como esperado.
- Se uma política RLS estiver desatualizada no ambiente remoto, fluxos reais podem falhar mesmo com build local verde.
- Push notification depende de permissões Android e token Expo válido.

## Prioridade de Correção Se Algo Falhar no Piloto

1. Login e perfil/role Supabase.
2. Pedido hospitalar gravado em `blood_requests`.
3. Aceitação do dador gravada em `donor_responses`.
4. PIN único e consistente.
5. RLS de hospital/dador.
6. Notificações e audit logs.
