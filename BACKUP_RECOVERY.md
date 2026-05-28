# Backup e Recuperação — Doe Sangue Angola

## Objetivo

Garantir que dados críticos do piloto podem ser exportados, restaurados e auditados.

## Backups Supabase

1. Ativar backups automáticos no projeto Supabase.
2. Confirmar retenção antes do piloto.
3. Guardar acesso ao painel Supabase com pelo menos dois responsáveis.
4. Registar data/hora do último backup antes de cada sessão piloto.

## Exportação de Tabelas Críticas

Antes do piloto, exportar pelo Admin:

- Dadores: `/admin/launch` → `dadores.csv`
- Hospitais: `/admin/launch` → `hospitais.csv`
- Pedidos: `/admin/launch` → `pedidos-sangue.csv`
- Respostas de dadores: `/admin/launch` → `respostas-dadores.csv`

## Processo de Restore

1. Pausar novas operações.
2. Ativar `NEXT_PUBLIC_MAINTENANCE_MODE=true`.
3. Exportar o estado atual para preservação.
4. Restaurar backup Supabase no painel ou por CLI.
5. Validar `/api/startup-health`.
6. Testar login, pedido, aceite, PIN e conclusão.
7. Remover modo manutenção.

## Dados Que Nunca Devem Ser Perdidos

- `users`
- `profiles`
- `donors`
- `hospitals`
- `blood_requests`
- `donor_responses`
- `notifications`
- `audit_logs`
- `legal_consents`

## Segurança

Não guardar backups com dados pessoais em repositórios públicos. Usar armazenamento privado e acesso limitado.
