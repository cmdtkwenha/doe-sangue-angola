# Release Candidate v1

Estado: candidato a piloto controlado.

Data de preparação: 28 Maio 2026.

## Escopo Congelado

Esta versão não adiciona novas funcionalidades. O foco é estabilidade,
verificação, documentação e prontidão operacional.

## O Que Está Pronto

- Login real por Supabase Auth para admin, hospital e dador.
- Proteção de rotas por perfil.
- Onboarding de hospital com ligação a hospital aprovado.
- Onboarding de dador com perfil real em Supabase.
- Criação de pedidos de sangue por hospital.
- Leitura de pedidos pelo Admin e pelo Dador.
- Aceitação de pedido pelo Dador.
- Geração e persistência de PIN em `donor_responses`.
- Validação de PIN no Hospital.
- Conclusão/cancelamento com estados normalizados.
- Notificações in-app e arquitetura realtime.
- Auditoria e monitorização operacional.
- Exportações CSV críticas no painel de lançamento.
- Documentação de deploy, rollback, backup e recuperação.

## Modos de Dados

Produção deve usar:

- `NEXT_PUBLIC_AUTH_MODE=supabase`
- `NEXT_PUBLIC_DATA_MODE=supabase`
- `NEXT_PUBLIC_PUSH_MODE=expo`

Mock/demo permanece apenas como fallback de desenvolvimento ou rollback
controlado. Não deve ser usado em operação real.

## Verificação de Ambiente

Antes do deploy, executar:

```bash
node scripts/deployment-check.cjs
npm run typecheck
npm run build
```

O script de deploy valida:

- variáveis essenciais;
- presença de migrações;
- conectividade Supabase;
- lembrete de build/typecheck.

## Supabase

Migrações revistas para execução segura em base existente:

- `create table if not exists`;
- `alter table add column if not exists`;
- `drop policy if exists` seguido de recriação;
- sem `drop table`, `truncate` ou reset de dados produtivos.

RLS documentado em `docs/security.md`, `docs/security-audit.md`,
`docs/supabase-setup.md` e nas migrações de segurança.

## Fluxos Críticos a Validar

- Admin login.
- Hospital login.
- Dador login.
- Onboarding de dador.
- Criação de pedido hospitalar.
- Aceitação pelo dador.
- Validação de PIN.
- Conclusão da doação.
- Notificações.
- Auditoria.

## Critérios de Aceitação RC

- `npm run typecheck` passa.
- `npm run build` passa.
- Todas as páginas principais abrem sem crash.
- Nenhuma UI temporária de debug aparece em produção.
- Exportações CSV funcionam no Admin.
- Variáveis de produção estão documentadas.
- Rollback para manutenção/mock está documentado.

## Riscos Restantes

- Fluxos reais dependem de RLS aplicada no Supabase remoto.
- Push real depende de development/production build Expo.
- Testes com utilizadores reais devem começar com dados de piloto e sem dados
  clínicos sensíveis.
