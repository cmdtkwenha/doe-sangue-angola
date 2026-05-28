# Roteiro Final de Teste

Use este roteiro antes de marcar a versão como pronta para piloto.

## Preparação

1. Confirmar variáveis de produção no Vercel e EAS.
2. Executar `supabase db push`.
3. Confirmar hospitais importados.
4. Confirmar que existe um admin real.
5. Confirmar que existe um hospital ligado a um registo aprovado.
6. Confirmar que existe pelo menos um dador com perfil completo.
7. Executar `node scripts/deployment-check.cjs`.
8. Executar `npm run typecheck`.
9. Executar `npm run build`.

## Admin Login

1. Abrir `/auth`.
2. Entrar com conta admin.
3. Confirmar redirecionamento para `/admin`.
4. Abrir `/admin/hospitals`.
5. Confirmar lista de hospitais reais.
6. Abrir `/admin/requests`.
7. Confirmar pedidos reais ou estado vazio amigável.
8. Abrir `/admin/launch`.
9. Confirmar checklist e exportações CSV.

Resultado esperado: Admin vê dados reais sem mensagens de debug.

## Hospital Login

1. Entrar com conta hospital.
2. Se aparecer onboarding, escolher hospital aprovado.
3. Confirmar redirecionamento para `/hospital`.
4. Abrir `/hospital/new-request`.
5. Criar pedido O- urgente.
6. Confirmar mensagem de sucesso.
7. Abrir `/hospital/requests`.
8. Confirmar pedido criado.

Resultado esperado: pedido guardado em Supabase com `hospital_id` correto.

## Dador Login e Onboarding

1. Entrar com conta dador.
2. Se aparecer onboarding, preencher:
   - tipo sanguíneo;
   - província;
   - município;
   - telefone;
   - género;
   - data de nascimento;
   - contacto de emergência.
3. Guardar perfil.
4. Confirmar abertura de `/mobile`.

Resultado esperado: dador entra na app sem loop de onboarding.

## Aceitação de Pedido

1. No dador, abrir pedidos disponíveis.
2. Confirmar detalhes do hospital:
   - nome;
   - município/província;
   - tipo sanguíneo;
   - urgência.
3. Aceitar pedido.
4. Confirmar modal de confirmação.
5. Confirmar cartão “Pedido aceite com sucesso”.
6. Confirmar PIN visível.

Resultado esperado: existe uma linha em `donor_responses`.

## PIN e Conclusão

1. No hospital, abrir painel de dadores recebidos.
2. Confirmar dador aceite.
3. Marcar “Chegou”.
4. Inserir PIN mostrado no dador.
5. Validar PIN.
6. Marcar “Doação concluída”.
7. Confirmar estado final.

Resultado esperado: estado `completed`, timestamp final e auditoria criada.

## Admin Monitorização

1. Abrir `/admin`.
2. Confirmar KPIs atualizados.
3. Abrir `/admin/audit`.
4. Confirmar eventos:
   - pedido criado;
   - dador aceite;
   - PIN validado;
   - doação concluída.
5. Abrir `/status`.
6. Confirmar saúde operacional.

Resultado esperado: Admin acompanha o fluxo completo.

## Falhas a Registar

Registar qualquer falha com:

- papel usado;
- página;
- ação;
- mensagem de erro;
- hora;
- captura de ecrã;
- ID do pedido ou dador, se existir.
