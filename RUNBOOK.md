# Runbook Operacional — Doe Sangue Angola

Este guia ajuda a equipa a operar o piloto em produção.

## Verificações Diárias

1. Abrir `/status`.
2. Confirmar estado “Operacional”.
3. Abrir `/admin`.
4. Confirmar painel “Operações de Produção”.
5. Verificar:
   - Auth operacional.
   - Supabase com latência aceitável.
   - Realtime operacional.
   - Notificações sem falhas.
   - Sem erros repetidos de PIN.

## Antes de Uma Sessão Piloto

1. Confirmar hospital piloto online.
2. Confirmar pelo menos 5 dadores com perfil completo.
3. Criar pedido de teste pequeno.
4. Confirmar que o dador vê pedido.
5. Confirmar PIN e conclusão.
6. Repor dados de teste se necessário.

## Monitorização

- `/admin`: painel nacional e operações.
- `/admin/audit`: auditoria, consentimentos e logs.
- `/admin/launch`: checklist de prontidão.
- `/status`: estado público do sistema.

## Feature Flags

Variáveis suportadas:

- `NEXT_PUBLIC_FEATURE_REALTIME`
- `NEXT_PUBLIC_FEATURE_NOTIFICATIONS`
- `NEXT_PUBLIC_FEATURE_MAPS`
- `NEXT_PUBLIC_FEATURE_GAMIFICATION`
- `NEXT_PUBLIC_FEATURE_EMERGENCYMODE`

Use `false` para pausar uma área sem remover código.

## Quando Algo Falha

1. Capturar página, papel do utilizador e hora.
2. Verificar painel de erros no admin.
3. Confirmar Supabase e RLS.
4. Repetir com uma conta de teste.
5. Abrir incidente se afetar pedido, PIN ou conclusão.
