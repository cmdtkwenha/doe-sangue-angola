# Checklist de Deploy — Doe Sangue Angola

## Antes do Deploy

1. Confirmar branch correta.
2. Confirmar `.env.production` ou Vercel env:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_AUTH_MODE=supabase`
   - `NEXT_PUBLIC_DATA_MODE=supabase`
3. Aplicar migrations Supabase.
4. Confirmar hospitais importados.
5. Confirmar contas piloto.

## Comandos

```bash
npm run check:lines
npm run typecheck
npm run build
npm run test
```

## Depois do Deploy Web

1. Abrir `/status`.
2. Entrar como admin.
3. Abrir `/admin/launch`.
4. Criar pedido de teste.
5. Aceitar no dador.
6. Validar PIN no hospital.
7. Concluir doação.
8. Confirmar auditoria e notificações.

## Depois do Build Android

1. Instalar APK em dispositivo real.
2. Entrar como dador piloto.
3. Aceitar pedido.
4. Confirmar PIN visível.
5. Testar notificações.

## Bloqueia Deploy Público

- Build falha.
- Typecheck falha.
- Pedido real não grava.
- PIN não valida.
- RLS permite acesso indevido.
