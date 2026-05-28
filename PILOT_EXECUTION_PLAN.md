# Plano de Execução do Piloto

Objetivo: executar um piloto pequeno, seguro e observável do Doe Sangue Angola
com 1 admin, 1 hospital e um grupo reduzido de dadores.

## Escopo

- Testar fluxo real com Supabase.
- Validar operação hospitalar com pedido urgente.
- Validar app do dador em telemóvel.
- Validar PIN, conclusão, notificações e auditoria.
- Recolher feedback por perfil.

Não incluir novas funcionalidades durante o piloto.

## Equipa Mínima

- Fundador: coordenação e decisão de pausa.
- Admin piloto: monitorização nacional.
- Hospital piloto: criação e validação de pedido.
- Dadores piloto: aceitação, PIN e feedback.
- Técnico: suporte a Supabase, Vercel e Expo.

## Antes do Piloto

1. Confirmar `NEXT_PUBLIC_FEATURE_FREEZE=true`.
2. Confirmar Supabase online.
3. Confirmar RLS aplicado.
4. Confirmar hospitais importados.
5. Confirmar contas piloto.
6. Executar `npm run typecheck`.
7. Executar `npm run build`.
8. Abrir `/status`.
9. Abrir `/admin/launch`.
10. Exportar CSVs iniciais.

## Durante o Piloto

1. Admin entra e acompanha `/admin/launch`.
2. Hospital entra e cria pedido urgente.
3. Dador abre pedidos disponíveis.
4. Dador aceita pedido.
5. Hospital confirma chegada.
6. Hospital valida PIN.
7. Hospital conclui doação.
8. Admin confirma auditoria.
9. Cada perfil envia feedback.
10. Problemas críticos são reportados com gravidade.

## Depois do Piloto

1. Exportar CSVs finais.
2. Rever problemas reportados.
3. Preencher `PILOT_FEEDBACK_REPORT.md`.
4. Classificar bloqueios.
5. Decidir avançar, repetir ou pausar.
6. Criar lista de correções.

## Critérios de Sucesso

- Login funciona nos três papéis.
- Pedido aparece no Admin e no Dador.
- Aceitação cria `donor_responses`.
- PIN é igual no Dador e no Hospital.
- Conclusão atualiza estado.
- Auditoria regista ações críticas.
- Pelo menos um feedback por perfil é recolhido.

## Critérios de Pausa

- Falha de login em mais de um papel.
- Dador não vê pedidos compatíveis.
- PIN não valida.
- Dados de outro hospital aparecem indevidamente.
- Supabase fica indisponível por mais de 15 minutos.
- RLS bloqueia fluxo principal ou expõe dados errados.
