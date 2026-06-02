-- Keep account status defaults aligned with Portuguese production constraints.
-- Safe for existing databases: no rows are deleted.

update public.users
set account_status = case account_status
  when 'active' then 'Ativo'
  when 'suspended' then 'Suspenso'
  else coalesce(account_status, 'Ativo')
end
where account_status is null or account_status in ('active', 'suspended');

update public.profiles
set account_status = case account_status
  when 'active' then 'Ativo'
  when 'suspended' then 'Suspenso'
  else coalesce(account_status, 'Ativo')
end
where account_status is null or account_status in ('active', 'suspended');

alter table public.users
  alter column account_status set default 'Ativo';

alter table public.profiles
  alter column account_status set default 'Ativo';

alter table public.users
  drop constraint if exists users_account_status_check;

alter table public.users
  add constraint users_account_status_check
  check (account_status in ('Ativo', 'Suspenso'));

alter table public.profiles
  drop constraint if exists profiles_account_status_check;

alter table public.profiles
  add constraint profiles_account_status_check
  check (account_status in ('Ativo', 'Suspenso'));
