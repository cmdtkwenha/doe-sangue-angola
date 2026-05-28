# Plano de Rollback — Doe Sangue Angola

## Quando Fazer Rollback

- Login real falha para todos.
- Supabase fica indisponível durante o piloto.
- PIN diverge entre dador e hospital.
- RLS expõe dados indevidos.
- Build novo quebra fluxo crítico.

## Rollback de Deploy

1. Abrir Vercel.
2. Escolher último deploy estável.
3. Clicar “Promote to Production”.
4. Confirmar `/status`.
5. Repetir teste de pedido, aceite e PIN.

## Desativar Realtime com Segurança

1. Definir `NEXT_PUBLIC_FEATURE_REALTIME=false`.
2. Fazer redeploy.
3. Confirmar que páginas ainda carregam por refresh/API.
4. Avisar equipa que updates podem exigir recarregamento.

## Ativar Manutenção

1. Definir `NEXT_PUBLIC_MAINTENANCE_MODE=true`.
2. Fazer redeploy.
3. Publicar aviso no grupo operacional.
4. Não criar novos pedidos até resolver.

## Rollback de Dados

1. Exportar estado atual.
2. Restaurar backup Supabase.
3. Validar tabelas críticas.
4. Confirmar audit logs.
5. Reabrir o sistema apenas após teste completo.
