# Database Schema

Doe Sangue Angola usa Supabase Postgres. As migrations ficam em
`supabase/migrations`.

## Schema Lock

O contrato de produção está em `DATABASE_SCHEMA_LOCK.md` e em
`scripts/schema-contract.cjs`.

Regra obrigatória: nenhum campo pode ser adicionado no frontend, mobile,
serviços ou APIs sem uma migration Supabase correspondente.

Antes de usar uma nova coluna:

1. Criar migration segura com `add column if not exists`.
2. Atualizar `scripts/schema-contract.cjs`.
3. Executar `npm run schema:verify`.
4. Executar `npm run typecheck` e `npm run build`.

O comando `npm run schema:verify` falha se encontrar referências literais a
colunas Supabase que não estejam no contrato bloqueado.

## Tabelas Principais

### `users`

Perfil interno ligado ao Supabase Auth.

- `auth_user_id` liga ao utilizador autenticado.
- `role` controla acesso: `admin`, `hospital`, `donor`.

### `hospitals`

Hospitais e clínicas.

- `user_id` liga o administrador do hospital.
- `verified` controla se a unidade está aprovada.

### `donors`

Dadores.

- `user_id` liga o dador ao Auth.
- `blood_type`, `province`, `municipality` alimentam matching.
- `points` alimenta recompensas.

### `blood_requests`

Pedidos de sangue.

- `hospital_id` indica a unidade clínica.
- `blood_type`, `units`, `urgency`, `status` controlam o workflow.

### `appointments`

Agendamentos e PIN.

- `donor_id`
- `hospital_id`
- `blood_request_id`
- `pin`
- `status`

### `notifications`

Notificações in-app.

- `user_id`
- `title`
- `body`
- `read`

### `rewards`

Histórico de pontos.

- `donor_id`
- `points`
- `reason`
- `tier`

### `audit_logs`

Rastro operacional.

- `actor_label`
- `action`
- `created_at`

## Índices

A migration `003_production_hardening.sql` adiciona índices para:

- login e roles
- pedidos por hospital/status
- appointments por dador/hospital
- notificações não lidas
- recompensas por dador
- auditoria recente

## RLS

As políticas seguem esta regra:

- Admin pode ler dados nacionais.
- Hospital só vê e gere dados do próprio hospital.
- Dador vê apenas dados próprios.

Antes de produção pública, valide com `docs/security-audit.md`.
