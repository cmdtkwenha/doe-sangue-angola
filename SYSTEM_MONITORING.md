# Monitorização e Auditoria do Sistema

Este documento descreve a visibilidade operacional usada no piloto do Doe Sangue Angola.

## Objetivo

Dar à Administração Nacional uma forma simples de acompanhar:

- estado da base de dados;
- sessão e autenticação;
- ligação ao Supabase;
- tempo de resposta;
- falhas recentes;
- eventos críticos do fluxo de doação.

## Eventos auditados

O sistema deve manter registos para:

- login;
- registo de hospital;
- aprovação de hospital;
- registo de dador;
- verificação de dador;
- criação de pedido de sangue;
- aceitação de pedido por dador;
- cancelamento de aceitação;
- validação de PIN;
- conclusão de doação.

## Admin > Auditoria & Logs

A página de auditoria lê a tabela `audit_logs` em Supabase.

Filtros disponíveis:

- Data;
- Utilizador;
- Tipo de evento.

Os resultados podem ser exportados em CSV para revisão operacional.

## Admin > Saúde do Sistema

A página de saúde mostra:

- Base de dados;
- Autenticação;
- Supabase;
- Tempo de resposta;
- Últimos erros.

O painel de erros destaca:

- falhas em pedidos;
- falhas em aprovações;
- falhas de PIN.

## Interpretação dos estados

- Operacional: a verificação passou.
- Aviso: o sistema respondeu, mas há sinal de lentidão ou falhas recentes.
- Crítico: a verificação falhou e requer investigação.

## Durante o piloto

Antes de cada sessão de teste:

1. Confirmar que `Admin > Saúde do Sistema` está operacional.
2. Confirmar que `Admin > Auditoria & Logs` mostra eventos recentes.
3. Fazer um teste rápido de login.
4. Criar um pedido pequeno de sangue.
5. Validar que a aceitação do dador cria evento de auditoria.

## Limitações atuais

Esta monitorização usa dados internos e logs de auditoria em Supabase.
Integrações externas como Sentry, Datadog ou alertas por SMS devem ser ligadas numa fase posterior.
