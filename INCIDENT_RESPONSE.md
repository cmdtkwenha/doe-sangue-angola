# Resposta a Incidentes — Doe Sangue Angola

## Severidades

### Crítico

- Login falha para todos.
- Hospital não consegue criar pedido.
- Dador aceita mas PIN não aparece.
- PIN divergente entre dador e hospital.
- Dados de outro hospital ficam visíveis.

### Alto

- Notificações falham para vários dadores.
- Realtime não atualiza painéis.
- Repetidas falhas de validação PIN.
- Admin não vê auditoria.

### Médio

- Lentidão Supabase.
- Estado vazio pouco claro.
- Feedback/reporte não grava.

## Fluxo de Resposta

1. Confirmar incidente em `/status`.
2. Verificar `/admin` e `/admin/audit`.
3. Identificar papel afetado: admin, hospital ou dador.
4. Pausar feature flag se necessário.
5. Comunicar ao fundador e equipa piloto.
6. Corrigir em staging ou local.
7. Validar com `npm run typecheck` e `npm run build`.
8. Fazer deploy e confirmar recuperação.

## Mensagem Para Utilizadores

“Estamos a verificar uma instabilidade operacional. Os dados de doação permanecem protegidos. Tente novamente dentro de alguns minutos ou contacte suporte.”

## Pós-Incidente

- Registar causa.
- Registar impacto.
- Registar correção.
- Atualizar checklist do piloto.
