# Checklist de Verificação de Bugs do Piloto

Objetivo: confirmar que a plataforma está estável para testes reais depois das correções recentes de UI.

Ambiente de teste:
- Usar dados reais no Supabase.
- Não usar modo mock durante esta verificação.
- Registar cada falha em `PILOT_BUG_TRACKER.md`.
- Anotar navegador, dispositivo, utilizador, hora e passos para reproduzir.

## Critério de Aprovação

O piloto pode avançar quando:
- Todos os itens críticos de Admin, Hospital e Dador estiverem aprovados.
- Não existirem bloqueios de login, pedido de sangue, PIN ou conclusão de doação.
- Modais e botões estiverem visíveis em desktop, tablet e mobile/PWA.

## Admin

| Estado | Verificação | Resultado esperado | Notas |
| --- | --- | --- | --- |
| [ ] | Login funciona | Admin entra e abre `/admin` sem erro. |  |
| [ ] | Aprovar hospital | Hospital pendente aparece em Verificação e sai da fila após aprovação. |  |
| [ ] | Verificar dador | Dador pendente aparece em Verificação e fica verificado após ação. |  |
| [ ] | Ver relatórios | Relatórios carregam com dados reais ou estado vazio amigável. |  |
| [ ] | Ver auditoria | Logs de ações críticas aparecem em Auditoria & Logs. |  |
| [ ] | Header estável | Reportar Problema, sino, utilizador e Sair não se sobrepõem. |  |
| [ ] | Modais Admin | Confirmações ficam centradas no desktop e legíveis em mobile. |  |

## Hospital

| Estado | Verificação | Resultado esperado | Notas |
| --- | --- | --- | --- |
| [ ] | Login funciona | Hospital entra e abre `/hospital` se estiver verificado. |  |
| [ ] | Criar pedido de sangue | Formulário aceita tipo sanguíneo, quantidade e prioridade válidos. |  |
| [ ] | Modal de confirmação | Modal aparece completo, com botões Cancelar e Confirmar pedido visíveis. |  |
| [ ] | Pedido aparece ativo | Pedido criado aparece em Pedidos de Sangue Ativos. |  |
| [ ] | Detalhes do dador | Dador aceite mostra nome, telefone, PIN, estado e tipo sanguíneo. |  |
| [ ] | Confirmar chegada | Ação muda o estado para chegada confirmada sem erro. |  |
| [ ] | Validar PIN | PIN correto muda o estado para PIN Validado. |  |
| [ ] | Concluir doação | Doação passa para Concluído e atualiza listas. |  |
| [ ] | Concluído sai dos ativos | Doação concluída desaparece de Pedidos ativos, Dadores Recebidos e Agendamentos. |  |
| [ ] | Histórico | Doação concluída aparece apenas em Histórico/Relatórios. |  |
| [ ] | Header estável | Reportar Problema, utilizador e Sair não se sobrepõem. |  |
| [ ] | Modais Hospital | Confirmar pedido, chegada, PIN, concluir e fechar pedido não ficam cortados. |  |

## Dador

| Estado | Verificação | Resultado esperado | Notas |
| --- | --- | --- | --- |
| [ ] | Login funciona | Dador entra e abre `/mobile` depois de perfil/verificação válidos. |  |
| [ ] | Perfil guarda | Perfil grava dados obrigatórios e mostra sucesso. |  |
| [ ] | Pedidos compatíveis | Dador vê apenas pedidos compatíveis com o seu tipo sanguíneo. |  |
| [ ] | Aceitar pedido | Modal de aceitação aparece e cria aceitação real no Supabase. |  |
| [ ] | Pedido desaparece | Pedido aceite sai de Pedidos Disponíveis. |  |
| [ ] | PIN aparece | Separador PIN mostra PIN, hospital, localização, ETA e estado. |  |
| [ ] | Cancelar aceitação | Cancelamento remove PIN ativo e reabre vaga quando aplicável. |  |
| [ ] | Histórico atualiza | Histórico mostra doações concluídas/canceladas corretamente. |  |
| [ ] | Navegação inferior | Modais não ficam atrás da barra inferior no PWA/mobile. |  |
| [ ] | Modais Dador | Detalhes, aceitação, cancelamento e perfil rolam corretamente em ecrãs pequenos. |  |

## Larguras de Ecrã

Testar cada fluxo crítico em:
- [ ] Desktop: largura igual ou superior a 1280px.
- [ ] Tablet: largura entre 768px e 1024px.
- [ ] Mobile/PWA: largura entre 360px e 430px.

## Registo Final

Data:

Responsável:

Resultado geral:
- [ ] Aprovado para piloto
- [ ] Aprovado com observações
- [ ] Bloqueado

Observações principais:
