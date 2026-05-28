# Bug Tracker do Piloto

Estado: feature freeze ativo. Não adicionar novas funcionalidades durante o
piloto. Registar apenas bugs, bloqueios e correções essenciais.

## Regras de Correção

- Corrigir apenas bugs encontrados durante testes piloto.
- Priorizar falhas que bloqueiam login, pedido, aceite, PIN ou conclusão.
- Não mudar UI, fluxos ou dados sem impacto direto no bug.
- Registar causa, correção e verificação antes de fechar.

## Severidade

| Severidade | Definição | Ação |
| --- | --- | --- |
| Crítica | Bloqueia fluxo principal ou expõe dados indevidos. | Corrigir antes de continuar. |
| Alta | Afeta um papel, mas existe alternativa operacional. | Corrigir antes do próximo teste. |
| Média | Causa confusão, mas não bloqueia o piloto. | Corrigir se houver tempo. |
| Baixa | Texto, alinhamento ou melhoria menor. | Agendar depois do piloto. |

## Bugs Abertos

| ID | Data | Papel | Página | Severidade | Descrição | Estado | Responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PILOT-BUG-001 | | | | | | Aberto | |

## Bugs Fechados

| ID | Correção | Verificação | Fechado por |
| --- | --- | --- | --- |
| | | | |

## Fluxos Que Não Podem Quebrar

- Admin login.
- Hospital login.
- Dador login.
- Onboarding do dador.
- Hospital cria pedido.
- Dador aceita pedido.
- PIN aparece no dador.
- Hospital valida PIN.
- Hospital conclui doação.
- Admin vê auditoria.

## Decisão de Pausa

Pausar o piloto se existir qualquer bug crítico sem correção validada.
