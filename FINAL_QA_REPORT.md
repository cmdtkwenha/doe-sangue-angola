# Relatório Final de QA — Doe Sangue Angola

Data: 28 Maio 2026
Estado: candidato a piloto, com validação final dependente do ambiente Supabase/EAS real.

## Resumo

A QA final cobriu os papéis Admin, Hospital/Clínica e Dador, com foco nos fluxos críticos do produto. Foram corrigidos bloqueios encontrados nos testes automatizados ligados à transição de dados mock para Supabase: alguns testes ainda esperavam hospitais mock locais, mas a arquitetura atual usa hospitais reais importados em Supabase.

## Verificações Executadas

- `npm run test`: passou.
- `npm run check:lines`: passou.
- `npm run audit`: passou com avisos não bloqueantes.
- `npm run typecheck`: passou.
- `npm run build`: passou.
- `npm run smoke`: passou.

## Papéis Testados

### Admin

- Rotas protegidas para `/admin`.
- Acesso a dados nacionais permitido.
- Auditoria restrita ao admin.
- Painéis e rotas principais existem.

### Hospital/Clínica

- Rotas protegidas para `/hospital`.
- Guardas impedem acesso a dados de outros hospitais.
- Fluxo mock de criação de pedido e estado do pedido validado em testes.

### Dador

- Rotas protegidas para `/mobile`.
- Guardas impedem acesso a dados de outro dador.
- Fluxo mock de pedido aceite, PIN, recompensa e notificações validado em testes.

## Fluxos Críticos

- Signup/login: coberto por tipo e arquitetura; validação real depende de Supabase Auth configurado.
- Onboarding hospital/dador: rotas existem; validação final exige conta real Supabase.
- Hospital cria pedido: coberto no fluxo automatizado mock e APIs existem.
- Admin vê pedido: fluxo de serviço validado; validação visual depende de ambiente.
- Dador aceita pedido: coberto no fluxo automatizado mock.
- PIN gerado: coberto por teste do `schedulingAgent`.
- PIN validado: coberto no fluxo automatizado.
- Doação concluída: coberto no fluxo automatizado.
- Cancelamento: lógica existe; teste manual recomendado no piloto.
- Notificações: criação e contagem cobertas por testes.
- Audit logs: criação de eventos coberta por testes.

## Correções Feitas Durante QA

- Atualizado teste de matching para a pontuação real do algoritmo inteligente.
- Corrigido ficheiro CSS que ultrapassava 250 linhas.
- Restaurado helper `isDemoAuthAllowed` esperado pelos testes.
- Ajustado resumo nacional para não depender de hospitais mock locais.
- Ajustada fila de verificação hospitalar em modo mock para não bloquear testes.
- Ajustado analytics piloto para contar contas piloto quando hospitais reais estão em Supabase.
- Atualizados testes de permissões para refletir que admin pode aceder a todos os portais.
- Corrigido fluxo mock de pedido/agendamento para funcionar quando hospitais locais estão vazios.

## Cobertura de Páginas

Rotas principais verificadas por smoke/auditoria:

- `/auth`
- `/auth/register`
- `/auth/forgot-password`
- `/admin`
- `/admin/requests`
- `/admin/hospitals`
- `/admin/donors`
- `/admin/notifications`
- `/admin/fraud`
- `/admin/audit`
- `/admin/reports`
- `/admin/settings`
- `/hospital`
- `/hospital/new-request`
- `/hospital/requests`
- `/hospital/donors`
- `/hospital/schedule`
- `/hospital/inventory`
- `/hospital/performance`
- `/hospital/reports`
- `/hospital/settings`
- `/mobile`
- `/mobile/settings`
- `/onboarding/hospital`
- `/onboarding/donor`

## Responsividade

- Layouts web e mobile existem e compilam.
- A validação visual final deve ser feita em navegador real nos tamanhos:
  - Desktop: 1440px.
  - Tablet: 768px.
  - Mobile: 390px.

## Decisão QA

O código está pronto para uma ronda de piloto controlado depois de confirmar no ambiente real:

- Supabase migrations aplicadas.
- Variáveis de produção configuradas.
- Contas reais de teste criadas.
- Android development/production build instalado em dispositivo real.
