# Prevenção de Fraude — Piloto

Data: 2026-06-08

## Objetivo

Detectar abuso e atividade suspeita sem bloquear doações legítimas durante o piloto.

## Dadores Duplicados

O sistema sinaliza possível duplicação quando encontra:

- Mesmo BI.
- Mesmo telefone.
- Mesmo email associado ao utilizador.

Ação recomendada:

- Verificar identidade presencialmente.
- Confirmar telefone e email.
- Manter apenas o perfil validado como apto.

## Hospitais Duplicados

O sistema sinaliza possível duplicação quando encontra:

- Mesmo número de licença.
- Mesmo telefone.
- Mesmo email institucional.

Ação recomendada:

- Validar licença sanitária.
- Confirmar contacto institucional.
- Suspender instituições suspeitas até revisão.

## Confiabilidade do Dador

Níveis usados no painel de fraude:

- `Excelente`: várias doações concluídas sem sinais negativos.
- `Boa`: pelo menos uma doação concluída e baixo risco.
- `Média`: cancelamentos repetidos ou histórico insuficiente.
- `Baixa`: cancelamentos/faltas frequentes.
- `Suspenso`: faltas ou cancelamentos em nível crítico.

Sinais analisados:

- Doações concluídas.
- Cancelamentos.
- Não comparecimentos.

## Abuso de PIN

O sistema sinaliza dadores com tentativas inválidas repetidas de PIN.

Sinais:

- 3 ou mais tentativas inválidas: revisão necessária.
- 5 ou mais tentativas inválidas: risco alto e bloqueio temporário.

Ação recomendada:

- Confirmar identidade do dador no hospital.
- Não concluir doação sem PIN válido.
- Registar qualquer tentativa suspeita em auditoria.

## Cancelamentos Excessivos

O sistema sinaliza dadores que aceitam pedidos e cancelam repetidamente.

Critérios:

- 3 ou mais cancelamentos: confiabilidade média.
- 4 ou mais cancelamentos: baixa.
- 6 ou mais cancelamentos: suspenso.

## Admin > Fraude

O painel apresenta:

- Dadores suspeitos.
- Hospitais suspeitos.
- Registos duplicados.
- Abuso de PIN.
- Casos já guardados em `fraud_reviews`.

## Dados Usados

Tabelas principais:

- `donors`
- `users`
- `hospitals`
- `donor_responses`
- `fraud_reviews`

## Nota Operacional

Durante o piloto, sinais de fraude devem gerar revisão humana antes de suspensão definitiva, salvo risco clínico ou operacional evidente.
