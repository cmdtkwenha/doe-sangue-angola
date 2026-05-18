# Relatório E2E - Phase 5

Data: 18 Maio 2026

## Objetivo

Validar o fluxo completo entre Hospital, Admin e Mobile sem adicionar novas
funcionalidades. A fase confirma que o produto existente consegue demonstrar o
ciclo de pedido de sangue com dados mock e arquitetura pronta para Supabase.

## Checklist do Workflow

| Etapa | Estado | Evidência |
| --- | --- | --- |
| Hospital cria pedido urgente | OK | `createWorkflowRequest` cria pedido O- crítico |
| Pedido fica guardado | OK | Pedido aparece em `mockStore.requests` |
| Admin vê o pedido | OK | Listas partilhadas usam o mesmo estado mock |
| Matching encontra dadores | OK | `matchingAgent` recomenda dadores compatíveis |
| Dador recebe pedido | OK | Notificação urgente é criada para o dador |
| Dador aceita | OK | `acceptWorkflowRequest` regista resposta aceite |
| PIN de 4 dígitos é gerado | OK | `schedulingAgent` gera PIN determinístico |
| Hospital vê dador a caminho | OK | Appointment aparece no snapshot do workflow |
| Hospital valida PIN | OK | `validateWorkflowPin` muda para `PIN Validado` |
| Pedido fica concluído | OK | `completeWorkflowDonation` muda para `Concluído` |
| Pontos de recompensa atualizam | OK | `rewardAgent` soma pontos do dador |
| Auditoria regista ações | OK | `auditLogs` aumenta durante o fluxo |
| Notificações são concluídas | OK | Alertas antigos ficam lidos; recompensa fica nova |

## Testes Executados

- `npm run test`
- `npm run smoke`
- `npm run check:lines`
- `npm run typecheck`
- `npm run build`

## Fixes Aplicados

- O fim da doação agora marca notificações antigas do dador como lidas.
- O provider Supabase replica esse comportamento ao concluir pedidos reais.
- O teste de workflow valida notificações lidas e notificação de recompensa.
- O smoke test cobre rotas críticas de workflow, notificações e push token.

## Estado Atual

O fluxo E2E principal está estável em mock mode. A arquitetura Supabase já tem
pontos de integração para pedidos, appointments, notificações, recompensas e
auditoria, mas a validação com um projeto Supabase real ainda depende de
variáveis de ambiente e seed de piloto.

## Próxima Verificação Manual

1. Entrar como hospital.
2. Criar pedido urgente O-.
3. Abrir Admin e confirmar pedido no painel.
4. Abrir Mobile e confirmar pedido disponível.
5. Aceitar pedido no Mobile.
6. Confirmar PIN no Hospital.
7. Concluir doação.
8. Verificar pontos, logs e notificações.
