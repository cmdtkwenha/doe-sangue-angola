# Resultados de Teste

Data: 28 Maio 2026.

## Verificações Locais

| Verificação | Resultado | Observação |
| --- | --- | --- |
| `npm run check:lines` | Passou | Todos os ficheiros ficam abaixo de 250 linhas. |
| `npm run typecheck` | Passou | Web e mobile TypeScript. |
| `npm run build` | Passou | Build web e validação mobile. |
| `node scripts/deployment-check.cjs` | Ação necessária | Faltam env vars locais de produção. |

## Deployment Links

| Item | Resultado | Observação |
| --- | --- | --- |
| Vercel web | Não verificado localmente | Confirmar URL final no painel Vercel. |
| `/status` produção | Não verificado localmente | Abrir depois do deploy. |
| `/admin/launch` produção | Não verificado localmente | Testar com conta admin real. |

## Supabase Produção

| Item | Resultado | Observação |
| --- | --- | --- |
| URL Supabase | Pendente | `NEXT_PUBLIC_SUPABASE_URL` não está no ambiente local. |
| Anon key | Pendente | `NEXT_PUBLIC_SUPABASE_ANON_KEY` não está no ambiente local. |
| Migrations | Local OK | `deployment-check` encontrou 37 migrations. |
| RLS | Pendente remoto | Confirmar com contas admin, hospital e dador. |

## Android APK

| Item | Resultado | Observação |
| --- | --- | --- |
| Perfil EAS pilot | Configurado | `apps/mobile/eas.json` tem perfil `pilot`. |
| APK instalado | Pendente | Exige build EAS e dispositivo Android. |
| Push permissions | Pendente em APK | Validar fora do Expo Go. |

## Variáveis de Ambiente

Obrigatórias para produção:

- `NEXT_PUBLIC_AUTH_MODE=supabase`
- `NEXT_PUBLIC_DATA_MODE=supabase`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_PUSH_MODE=expo`
- `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor

## Resultado Funcional Manual

| Fluxo | Resultado | Evidência |
| --- | --- | --- |
| Admin login | Pendente | Testar em produção. |
| Hospital login | Pendente | Testar em produção. |
| Dador login | Pendente | Testar em produção. |
| Donor onboarding | Pendente | Testar em produção. |
| Hospital cria pedido | Pendente | Testar em produção. |
| Dador aceita | Pendente | Testar em produção. |
| PIN validado | Pendente | Testar em produção. |
| Doação concluída | Pendente | Testar em produção. |

## Nota

Este ficheiro deve ser atualizado durante o teste real. Não marcar piloto como
aprovado enquanto deployment, Supabase e APK estiverem pendentes.
