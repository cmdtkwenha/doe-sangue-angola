# Guia de Reset do Piloto

Este guia explica como limpar dados de teste sem apagar esquema, migrações ou a conta Admin principal.

## Antes de qualquer reset

1. Fazer backup no Supabase.
2. Confirmar que está no ambiente correto.
3. Avisar equipa do piloto.
4. Confirmar que ninguém está a criar pedidos ou validar PIN.
5. Guardar CSV dos dados que precisam de análise posterior.

## Reset apenas de pedidos

Usar quando quer remover pedidos de sangue e começar nova ronda de testes.

Apagar em ordem:

1. `notifications` relacionadas com pedidos.
2. `audit_logs` de teste, se a equipa aceitar perder estes registos.
3. `request_acceptances`.
4. `donor_responses`.
5. `blood_requests`.

Preservar:

- Admin;
- utilizadores;
- dadores;
- hospitais;
- consentimentos;
- inventário, se não estiver ligado ao teste.

## Reset apenas de aceitações

Usar quando o pedido deve continuar, mas os dadores aceites e PINs devem ser limpos.

Apagar:

1. `request_acceptances`.
2. `donor_responses`.
3. notificações de aceitação/PIN.

Depois atualizar pedidos afetados:

- `accepted_count = 0`;
- `remaining_slots = units_needed`;
- `status = 'Aberto'`.

## Reset completo do piloto

Usar quando todos os testes precisam recomeçar do zero.

Executar:

```sql
scripts/reset-pilot-data.sql
```

Este script preserva:

- esquema;
- migrations;
- políticas RLS;
- `auth.users`;
- conta `admin@sangueangola.ao`.

Remove dados operacionais e contas públicas de teste.

## Reset apenas do fluxo operacional

Executar:

```sql
scripts/reset-pilot-workflow-data.sql
```

Este reset é mais leve e preserva dadores/hospitais.

## Depois do reset

1. Entrar como Admin.
2. Confirmar hospitais pendentes/verificados.
3. Confirmar dadores pendentes/verificados.
4. Criar um pedido de teste.
5. Aceitar como dador.
6. Confirmar que o PIN aparece.
7. Validar PIN no Hospital.
8. Concluir doação.
9. Confirmar auditoria e relatórios.

## Registo operacional

Anotar sempre:

- quem executou;
- data e hora;
- ambiente;
- tipo de reset;
- motivo;
- resultado.
