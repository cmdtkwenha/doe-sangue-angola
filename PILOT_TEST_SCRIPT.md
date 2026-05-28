# Roteiro de Teste do Piloto — Doe Sangue Angola

Objetivo: validar o fluxo real com 1 hospital e até 20 dadores antes do lançamento público.

## Preparação

1. Confirmar variáveis em produção:
   - `NEXT_PUBLIC_AUTH_MODE=supabase`
   - `NEXT_PUBLIC_DATA_MODE=supabase`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Confirmar Supabase:
   - migrations aplicadas.
   - hospitais importados.
   - RLS ativo.
3. Criar contas reais:
   - 1 admin.
   - 1 hospital ligado a hospital aprovado.
   - 20 dadores com tipo sanguíneo e província.

## Teste 1 — Admin

1. Entrar como admin.
2. Abrir `/admin`.
3. Confirmar KPIs carregados.
4. Abrir `/admin/hospitals`.
5. Confirmar lista de hospitais reais.
6. Abrir `/admin/requests`.
7. Confirmar que não há erro de Supabase.
8. Abrir `/admin/audit`.
9. Confirmar logs recentes.

Resultado esperado: admin vê dados nacionais e não encontra páginas vazias sem explicação.

## Teste 2 — Hospital

1. Entrar como hospital.
2. Se aparecer onboarding, selecionar hospital aprovado.
3. Abrir `/hospital`.
4. Criar pedido urgente O- em `/hospital/new-request`.
5. Confirmar mensagem de sucesso.
6. Abrir `/hospital/requests`.
7. Confirmar pedido com estado correto.
8. Confirmar que `/admin/requests` mostra o mesmo pedido.

Resultado esperado: pedido fica gravado em Supabase e aparece para admin/hospital.

## Teste 3 — Dador

1. Entrar como dador.
2. Se aparecer onboarding, preencher perfil mínimo:
   - tipo sanguíneo.
   - província.
   - município.
3. Abrir `/mobile`.
4. Ver pedidos compatíveis.
5. Abrir detalhes do pedido.
6. Confirmar hospital, localização, tipo sanguíneo e urgência.
7. Clicar aceitar e confirmar.
8. Confirmar cartão “Pedido aceite com sucesso”.
9. Confirmar PIN visível.

Resultado esperado: `donor_responses` recebe linha com PIN único e estado `accepted`.

## Teste 4 — Hospital Recebe Dador

1. Voltar ao hospital.
2. Abrir painel de dadores recebidos/lista ETA.
3. Confirmar dador aceite.
4. Marcar “Chegou”.
5. Inserir PIN mostrado no telemóvel do dador.
6. Validar PIN.
7. Marcar “Doação concluída”.

Resultado esperado: estado progride para `arrived`, `pin_validated`, `completed`.

## Teste 5 — Cancelamento

1. Criar segundo pedido.
2. Aceitar com dador.
3. No hospital, cancelar antes de completar.
4. Confirmar que o dador sai da lista ativa.
5. Confirmar que aparece no histórico.

Resultado esperado: estado `cancelled`, sem permitir conclusão posterior.

## Teste 6 — Notificações e Auditoria

1. No dador, abrir notificações.
2. Confirmar notificações do pedido/estado.
3. Marcar notificações como lidas.
4. No admin, abrir auditoria.
5. Confirmar eventos:
   - login.
   - pedido criado.
   - dador aceitou.
   - PIN validado.
   - doação concluída.
   - cancelamento, se testado.

Resultado esperado: notificações e logs refletem as ações reais.

## Teste 7 — Responsividade

1. Testar admin em desktop.
2. Testar hospital em desktop/tablet.
3. Testar dador em telemóvel Android.
4. Confirmar que botões não ficam escondidos.
5. Confirmar que PIN não fica atrás da navegação inferior.

## Critério de Aprovação

O piloto pode avançar se:

- Login funciona para os três papéis.
- Pedido hospitalar aparece para admin e dador.
- Dador aceita e recebe PIN.
- Hospital valida PIN e conclui.
- Audit logs e notificações são criados.
- Nenhum crash acontece durante o fluxo.
