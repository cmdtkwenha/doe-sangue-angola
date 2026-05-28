# Script Manual de Teste do Piloto

Use este roteiro durante a sessão real. Marque cada passo como aprovado ou
falhado e registe bugs em `PILOT_BUG_TRACKER.md`.

## 1. Admin Testing

- [ ] Abrir link de produção.
- [ ] Entrar com conta admin real.
- [ ] Confirmar redirecionamento para `/admin`.
- [ ] Abrir `/admin/hospitals`.
- [ ] Confirmar hospitais reais aparecem.
- [ ] Abrir `/admin/requests`.
- [ ] Confirmar pedidos abertos ou estado vazio amigável.
- [ ] Abrir `/admin/launch`.
- [ ] Confirmar painel de execução do piloto.
- [ ] Confirmar sistema de saúde mostra estado claro.
- [ ] Exportar CSVs críticos.
- [ ] Abrir `/admin/audit`.
- [ ] Confirmar auditoria aparece depois das ações.

## 2. Hospital Testing

- [ ] Entrar com conta hospital real.
- [ ] Confirmar redirecionamento para `/hospital`.
- [ ] Se aparecer onboarding, ligar a hospital aprovado.
- [ ] Abrir `/hospital/new-request`.
- [ ] Criar pedido urgente O-.
- [ ] Confirmar mensagem de sucesso.
- [ ] Abrir `/hospital/requests`.
- [ ] Confirmar pedido criado.
- [ ] Aguardar aceite do dador.
- [ ] Abrir Dadores Recebidos ou Lista ETA.
- [ ] Confirmar dador aceite.
- [ ] Marcar “Chegou”.
- [ ] Inserir PIN mostrado ao dador.
- [ ] Validar PIN.
- [ ] Concluir doação.
- [ ] Confirmar estado final.

## 3. Donor Testing

- [ ] Abrir APK Android ou preview mobile.
- [ ] Entrar com conta dador real.
- [ ] Completar onboarding se necessário.
- [ ] Confirmar abertura de `/mobile`.
- [ ] Ver pedidos disponíveis.
- [ ] Confirmar hospital, localização, sangue, bolsas e urgência.
- [ ] Aceitar pedido.
- [ ] Confirmar modal de confirmação.
- [ ] Confirmar cartão “Pedido aceite com sucesso”.
- [ ] Confirmar PIN visível.
- [ ] Confirmar status muda após chegada, PIN validado e conclusão.
- [ ] Enviar feedback.

## 4. Environment Checklist

- [ ] `NEXT_PUBLIC_APP_ENV=production`.
- [ ] `NEXT_PUBLIC_AUTH_MODE=supabase`.
- [ ] `NEXT_PUBLIC_DATA_MODE=supabase`.
- [ ] `NEXT_PUBLIC_PUSH_MODE=expo`.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado apenas no servidor.
- [ ] `NEXT_PUBLIC_FEATURE_FREEZE=true`.
- [ ] `NEXT_PUBLIC_MAINTENANCE_MODE=false`.

## 5. Supabase Checklist

- [ ] `supabase db push` aplicado.
- [ ] RLS ativo.
- [ ] Triggers de signup ativos.
- [ ] Hospitais importados.
- [ ] `donor_responses` existe.
- [ ] `support_issues` existe com `severity`.
- [ ] Realtime ativo nas tabelas necessárias.

## 6. Android APK Checklist

- [ ] `eas build --platform android --profile pilot` concluído.
- [ ] APK instalado em dispositivo real.
- [ ] Login funciona no APK.
- [ ] Onboarding funciona no APK.
- [ ] Pedido aparece no APK.
- [ ] PIN visível no APK.
- [ ] Notificações pedem permissão corretamente.

## 7. Fecho

- [ ] Exportar CSV final.
- [ ] Atualizar `TEST_RESULTS.md`.
- [ ] Atualizar `PILOT_BUG_TRACKER.md`.
- [ ] Decidir: avançar, repetir ou pausar.
