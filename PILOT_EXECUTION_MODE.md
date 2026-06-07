# Modo de Execução do Piloto

Estado: congelamento de funcionalidades ativo.

## Objetivo

Executar testes reais do Doe Sangue Angola com:

- 1 Administrador Nacional.
- 2 hospitais ou clínicas.
- 5 a 10 dadores.

## Regras do Modo Piloto

- Não adicionar novas funcionalidades.
- Não redesenhar a interface.
- Não alterar schema, exceto se um bug crítico exigir migração segura.
- Corrigir apenas bugs encontrados durante testes reais.
- Usar português de Angola em todos os textos.
- Usar apenas dados reais do Supabase.
- Não usar dados mock em produção.

## Fluxos Congelados

- Login e permissões por papel.
- Registo e verificação de hospital.
- Registo e verificação de dador.
- Criação de pedido de sangue.
- Aceitação do pedido pelo dador.
- Geração e validação de PIN.
- Conclusão de doação.
- Relatórios e auditoria.

## Critério Para Corrigir Bug

Corrigir imediatamente se o bug:

- bloqueia login;
- bloqueia onboarding;
- bloqueia criação de pedido;
- bloqueia aceite do dador;
- impede visualização do PIN;
- impede validação do PIN;
- impede conclusão de doação;
- mostra dados de outro utilizador;
- causa crash.

## Critério Para Não Corrigir Durante o Piloto

Não corrigir durante o piloto se for:

- pedido de nova funcionalidade;
- melhoria visual não bloqueante;
- alteração de fluxo aprovada apenas para versão futura;
- integração SMS, WhatsApp ou pagamentos;
- alteração grande de base de dados sem bug crítico.

## Decisão de Paragem

Pausar o piloto se houver bug crítico aberto que afete segurança, privacidade ou o ciclo pedido → aceite → PIN → conclusão.
