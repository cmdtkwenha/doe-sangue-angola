# Reset seguro da base de dados piloto

Este guia explica como limpar dados de teste do piloto sem apagar o esquema,
as migrações ou a conta principal de administração.

## Antes de executar

1. Faça backup no Supabase antes de qualquer reset.
2. Confirme que está no projeto Supabase correto.
3. Confirme que quer preservar apenas:
   - `admin@sangueangola.ao`
   - tabelas e esquema da base de dados
   - utilizadores em `auth.users`

O script não apaga tabelas e não mexe em ficheiros de migração.

## Como executar no Supabase SQL Editor

1. Abra o painel Supabase.
2. Entre em **SQL Editor**.
3. Abra o ficheiro:
   `scripts/reset-pilot-data.sql`
4. Cole o conteúdo no editor.
5. Leia novamente os comentários de segurança no topo.
6. Clique em **Run**.

O script usa:

```sql
begin;
...
commit;
```

Também mostra contagens antes e depois do reset.

## O que é apagado

O reset remove dados operacionais e contas públicas de teste:

- `audit_logs`
- `notifications`
- `pilot_feedback`
- `request_acceptances`
- `donor_responses`
- `appointments`, se existir
- `blood_requests`
- `hospital_inventory_movements`, se existir
- `inventory_movements`, se existir
- `hospital_inventory`
- `donor_verifications`
- `hospital_verifications`
- `hospital_notification_preferences`
- `hospital_staff`
- `donors`
- `hospitals`
- `profiles`, exceto admin
- `users`, exceto `admin@sangueangola.ao`

## O que é preservado

- Tabelas
- Migrações
- Políticas RLS
- Funções SQL
- `auth.users`
- `public.users` da conta `admin@sangueangola.ao`

## Recriar utilizadores piloto

Depois do reset:

1. Crie os utilizadores em Supabase Auth.
2. Use emails piloto, por exemplo:
   - `hospital@pilot.doesangue.ao`
   - `dador1@pilot.doesangue.ao`
   - `dador2@pilot.doesangue.ao`
   - `dador3@pilot.doesangue.ao`
   - `dador4@pilot.doesangue.ao`
   - `dador5@pilot.doesangue.ao`
3. Execute `scripts/seed-pilot-users.sql` se quiser recriar dados básicos.
4. Faça login como hospital e crie um pedido real de teste.
5. Faça login como dador e aceite o pedido.

## Nota importante

Se o reset for executado no projeto errado, os dados piloto desse projeto serão
apagados. Faça sempre backup primeiro.
