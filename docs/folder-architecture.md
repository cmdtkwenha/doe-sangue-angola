# Arquitetura de Pastas

Doe Sangue Angola usa monorepo para partilhar lógica entre web e mobile.

## Estrutura Principal

- `apps/web`: aplicação Next.js para Admin, Hospital e preview Mobile.
- `apps/mobile`: aplicação Expo React Native do dador.
- `packages/shared-types`: tipos TypeScript partilhados.
- `packages/shared-services`: serviços, providers, mock data, API, realtime e Supabase.
- `packages/agents`: lógica de negócio para matching, fraude, recompensas e elegibilidade.
- `docs`: documentação operacional e guias de deployment.
- `scripts`: verificações locais de qualidade.
- `supabase`: migrações e seed data.

## Convenções

- Páginas apenas compõem componentes.
- Componentes grandes devem ser divididos antes de chegar a 250 linhas.
- Serviços não devem importar UI.
- Agents devem conter regras de negócio puras.
- UI deve ficar em Português por defeito.
- Inglês e Francês ficam preparados no módulo `i18n`.

## Web

- `app/components/admin`: dashboard e gestão nacional.
- `app/components/hospital`: portal clínico.
- `app/components/mobile`: experiência mobile renderizada na web.
- `app/components/auth`: login, registo e proteção por função.
- `app/components/ui`: estados reutilizáveis de loading, erro e vazio.
- `app/components/accessibility`: helpers de foco, modal e formulários acessíveis.
- `app/hooks`: hooks reutilizáveis.
- `app/constants`: navegação e ações partilhadas.
- `app/utils`: utilitários de interface.

## Mobile

- `app/components`: cartões, ações e experiência nativa do dador.
- `app/components/feedback`: estados de erro, vazio, loading e offline.
- `app/hooks`: hooks Expo, incluindo notificações push.
- `lib`: clientes externos preparados para Supabase.

## Dados

O modo padrão é mock. Para Supabase no futuro:

1. Configurar `.env.local`.
2. Mudar `NEXT_PUBLIC_DATA_MODE=supabase`.
3. Aplicar migrações.
4. Validar RLS antes de produção.
