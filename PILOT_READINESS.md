# Prontidão do Piloto

Este documento define como validar se o Doe Sangue Angola está pronto para testes reais.

## Objetivo

Confirmar que Admin, Hospital, Dador e Sistema estão preparados antes de envolver utilizadores do piloto.

## Estados do Pilot Health Score

- Pronto: todos os critérios principais estão concluídos.
- Atenção: há critérios pendentes, mas o sistema pode continuar em preparação.
- Crítico: existe bloqueio de integridade, acesso ou operação básica.

## Checklist Admin

- [ ] Login
- [ ] Aprovar hospital
- [ ] Verificar dador
- [ ] Relatórios

## Checklist Hospital

- [ ] Login
- [ ] Criar pedido
- [ ] Ver dador
- [ ] Validar PIN
- [ ] Concluir doação

## Checklist Dador

- [ ] Login
- [ ] Completar perfil
- [ ] Aceitar pedido
- [ ] Ver PIN
- [ ] Cancelar aceitação

## Checklist Sistema

- [ ] RLS validado
- [ ] Auditoria ativa
- [ ] Relatórios ativos
- [ ] Sem erros críticos

## Onde validar

Abrir:

```text
Admin > Prontidão do Piloto
```

O painel mostra:

- percentagem de critérios concluídos;
- estado atual;
- checklist agrupado por área;
- dados de workflow;
- verificação de integridade;
- monitorização de erros;
- exportação dos resultados piloto.

## Antes de iniciar o piloto

1. Confirmar que o score está `Pronto`.
2. Confirmar que não há erros críticos.
3. Confirmar que existe pelo menos um hospital verificado.
4. Confirmar que existe pelo menos um dador verificado.
5. Fazer um teste completo:
   - hospital cria pedido;
   - dador aceita;
   - PIN aparece;
   - hospital valida PIN;
   - hospital conclui doação.

## Se o estado for Atenção

1. Abrir os itens pendentes.
2. Corrigir apenas bloqueios do piloto.
3. Repetir o teste completo.
4. Não iniciar teste real até os fluxos críticos estarem confirmados.

## Se o estado for Crítico

1. Parar preparação do piloto.
2. Consultar `SYSTEM_MONITORING.md`.
3. Consultar `DATA_RECOVERY_CHECKLIST.md`.
4. Corrigir o bloqueio.
5. Reexecutar validação.
