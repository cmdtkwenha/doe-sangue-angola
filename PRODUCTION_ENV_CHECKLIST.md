# Checklist de Ambiente de Produção

## Variáveis Obrigatórias

- `NEXT_PUBLIC_AUTH_MODE=supabase`
- `NEXT_PUBLIC_DATA_MODE=supabase`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Variáveis Operacionais

- `NEXT_PUBLIC_APP_ENV=production`
- `NEXT_PUBLIC_MONITORING_ENABLED=true`
- `NEXT_PUBLIC_PILOT_MODE=true`
- `NEXT_PUBLIC_FEATURE_FREEZE=true`
- `NEXT_PUBLIC_MAINTENANCE_MODE=false`

## Feature Flags

- `NEXT_PUBLIC_FEATURE_REALTIME=true`
- `NEXT_PUBLIC_FEATURE_NOTIFICATIONS=true`
- `NEXT_PUBLIC_FEATURE_MAPS=true`
- `NEXT_PUBLIC_FEATURE_GAMIFICATION=true`
- `NEXT_PUBLIC_FEATURE_EMERGENCY_MODE=false`

## Verificação Automática

Executar:

```bash
node scripts/deployment-check.cjs
npm run typecheck
npm run build
```

## Verificação Manual

1. Abrir `/status`.
2. Confirmar estado operacional.
3. Entrar como admin.
4. Abrir `/admin/launch`.
5. Confirmar checklist automática.
6. Exportar CSVs críticos.
7. Criar pedido de teste.
8. Validar aceite, PIN e conclusão.
