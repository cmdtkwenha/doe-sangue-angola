# Migração de Mock para Produção

Este guia explica como mover o Doe Sangue Angola de dados mock para dados reais
sem perder a capacidade de demonstração.

## Estado Atual

O modo padrão continua seguro:

- `NEXT_PUBLIC_DATA_MODE=mock`
- `EXPO_PUBLIC_DATA_MODE=mock`
- Dados partilhados vêm de `mockData`.
- UI usa serviços partilhados e alguns painéis ainda leem helpers mock-first.
- Repositórios Supabase já existem para requests, donors, hospitals,
  notifications, rewards e audit logs.

## Lógica Ainda Mock-Only

Áreas marcadas com `TODO(production)`:

- `mockData.ts`: fonte de dados de demonstração.
- `mockProvider.ts`: provider para demos e testes.
- `requestService.ts`: criação e atualização em memória.
- `appointmentService.ts`: PIN e agendamentos em memória.
- `donorService.ts`: pontos e painel do dador em memória.
- `hospitalService.ts`: painel hospitalar em memória.
- `notificationService.ts`: histórico in-app mock.
- `verificationService.ts`: filas de verificação e fraude em memória.
- `summaryService.ts`: KPIs agregados a partir de arrays.

## Interfaces Criadas

Contratos ficam em `packages/shared-services/src/interfaces`:

- `RequestRepositoryInterface`
- `DonorRepositoryInterface`
- `HospitalRepositoryInterface`
- `NotificationRepositoryInterface`
- `AuditRepositoryInterface`
- `AppRepositories`

O registry fica em:

- `packages/shared-services/src/repositories/repositoryRegistry.ts`

## Ordem Recomendada

1. Confirmar migrations Supabase em ambiente staging.
2. Validar RLS por função: admin, hospital e donor.
3. Criar contas reais de teste.
4. Ligar `supabaseProvider` em staging.
5. Migrar requests e appointments primeiro.
6. Migrar notifications e audit logs.
7. Migrar dashboards agregados para views ou RPCs.
8. Executar testes de papel por função.
9. Manter rollback para `NEXT_PUBLIC_DATA_MODE=mock`.
10. Só depois ativar produção.

## Separação UI/Dados

Regra para novas telas:

- Componentes React recebem dados por props ou chamam hooks finos.
- Serviços chamam `getRepositories()`.
- Repositórios conhecem Supabase ou mock.
- UI não importa `mockData` diretamente.

## Checklist de Corte

- `npm run check:lines`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run audit`
- Validar `/admin`, `/hospital`, `/mobile`.
- Confirmar que as notificações reais só disparam em ambiente aprovado.
- Confirmar logs de auditoria para criação, aceitação, PIN e conclusão.
