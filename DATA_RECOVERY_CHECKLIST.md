# Checklist de Recuperação de Dados

Use este checklist depois de restaurar backup, executar rollback ou limpar dados do piloto.

## Validação inicial

- [ ] Ambiente correto confirmado.
- [ ] Supabase abre sem erros.
- [ ] `npm run schema:verify` passa.
- [ ] Página `/status` responde.
- [ ] Admin consegue entrar.
- [ ] `Admin > Saúde do Sistema` está operacional.

## Verificação de utilizadores

- [ ] `admin@sangueangola.ao` existe em Auth.
- [ ] Admin existe em `public.users`.
- [ ] Admin tem `role = admin`.
- [ ] Admin tem `account_status = Ativo`.
- [ ] Não há utilizadores críticos duplicados.

## Verificação de hospitais

- [ ] Hospitais aparecem em `Admin > Hospitais & Clínicas`.
- [ ] Hospitais pendentes aparecem em `Admin > Verificação`.
- [ ] Hospitais verificados têm estado `Verificado`.
- [ ] Utilizador hospital está ligado ao hospital correto.
- [ ] Hospital suspenso não consegue criar pedidos.

## Verificação de dadores

- [ ] Dadores aparecem em `Admin > Dadores`.
- [ ] Dadores pendentes aparecem em `Admin > Verificação`.
- [ ] Dadores verificados têm estado elegível/verificado.
- [ ] Dador vê apenas pedidos compatíveis.
- [ ] Dador não verificado não consegue aceitar pedidos.

## Integridade dos pedidos

- [ ] Cada pedido tem `hospital_id`.
- [ ] Cada pedido tem `blood_type`.
- [ ] Cada pedido tem `units_needed`.
- [ ] Cada pedido tem `status` em português.
- [ ] Não há pedidos órfãos sem hospital.
- [ ] Pedidos concluídos não aparecem em listas ativas.

## Integridade de aceitações e PIN

- [ ] Cada aceitação tem dador, pedido e hospital.
- [ ] Existe apenas um PIN ativo por aceitação.
- [ ] PIN aparece no app do dador.
- [ ] Hospital vê o mesmo PIN.
- [ ] PIN validado não pode ser reutilizado.
- [ ] Doação concluída sai das listas ativas.

## Auditoria e notificações

- [ ] Login cria evento de auditoria.
- [ ] Criação de pedido cria evento.
- [ ] Aceitação de dador cria evento.
- [ ] Validação de PIN cria evento.
- [ ] Conclusão de doação cria evento.
- [ ] Notificações recentes carregam.

## Teste final

- [ ] Hospital cria pedido.
- [ ] Dador aceita.
- [ ] PIN aparece.
- [ ] Hospital confirma chegada.
- [ ] Hospital valida PIN.
- [ ] Hospital conclui doação.
- [ ] Admin vê relatório/auditoria atualizados.

## Resultado

Se algum item falhar:

1. Parar o piloto.
2. Registar erro com captura de ecrã.
3. Consultar `ROLLBACK_PLAN.md`.
4. Corrigir apenas o bloqueador.
5. Repetir checklist.
