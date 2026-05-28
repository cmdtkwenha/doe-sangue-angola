# Auditoria de Dados Mock

Data: 28 Maio 2026.

Objetivo: confirmar que produção usa Supabase e que dados mock ficam apenas
atrás de `DATA_MODE=mock` ou em superfícies de desenvolvimento.

## Ficheiros Mock Encontrados

| Ficheiro | Estado |
| --- | --- |
| `packages/shared-services/src/mockData.ts` | Mantido para desenvolvimento local. |
| `packages/shared-services/src/mockStore.ts` | Mantido para `mockProvider` e demos locais. |
| `packages/shared-services/src/mockProvider.ts` | Mantido apenas quando `DATA_MODE=mock` fora de produção. |
| `packages/shared-services/src/repositories/mockRepositories.ts` | Mantido apenas para desenvolvimento/mock. |
| `packages/shared-services/src/demoScenarioService.ts` | Mantido para demos controladas, não usado no fluxo principal. |
| `apps/web/app/components/demo/*` | Componentes de demo isolados, fora das rotas principais. |
| `apps/web/app/components/hospital/automation/*` | Componentes antigos não renderizados no portal principal após limpeza. |
| `apps/mobile/assets/mockups` | Referências visuais, não fonte de dados. |

## Guardas de Produção

- `getDataMode()` assume `supabase` quando `NODE_ENV=production` e a variável
  pública não está definida.
- `getDataProvider()` só devolve `mockProvider` quando `DATA_MODE=mock` e o
  ambiente não é produção.
- `getRepositories()` devolve sempre repositórios Supabase em produção.
- O app mobile não volta para `getDonorHome("d1")` quando Supabase está ativo.
- `mockStore` e `mockProvider` deixaram de ser exportados pelo índice público do
  pacote partilhado.

## Removido de Caminhos de Produção

- Admin `Dadores` deixou de importar `donors` mock e agora lê `/api/donors`.
- Admin `Inventário de Sangue` deixou de importar `inventory` mock e agora lê
  `/api/admin/inventory-summary`.
- Admin principal deixou de renderizar painel piloto com contagens mockadas.
- Hospital principal deixou de renderizar automações antigas baseadas em
  `getWorkflowSnapshot`, `inventory` e alertas mockados.
- Página inicial deixou de mostrar contagens mockadas quando Supabase não está
  configurado.

## Ainda Usado em Desenvolvimento

Mock continua disponível para:

- desenvolvimento local sem Supabase;
- testes de interface isolados;
- recuperação controlada fora de produção;
- documentação histórica de demos.

## Pendências Para Verificação Manual

- Confirmar em Vercel que `NEXT_PUBLIC_DATA_MODE=supabase`.
- Confirmar em EAS que `EXPO_PUBLIC_DATA_MODE=supabase`.
- Confirmar que `/admin`, `/hospital` e `/mobile` não mostram dados quando
  Supabase está vazio.
- Confirmar que pedidos, dadores e inventário aparecem apenas após registos
  reais no banco.

## Comandos Executados

```bash
rg "mockStore|mockProvider|mockData|DATA_MODE" apps packages scripts
npm run typecheck
npm run build
```

Resultado local:

- `npm run check:lines`: passou.
- `npm run typecheck`: passou.
- `npm run build`: passou.
