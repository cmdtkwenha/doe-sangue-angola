-- Admin user management, account status, and access control.

alter table public.profiles
add column if not exists account_status text not null default 'active',
add column if not exists last_activity_at timestamptz,
add column if not exists password_reset_requested_at timestamptz,
add column if not exists updated_at timestamptz not null default now();

alter table public.users
add column if not exists account_status text not null default 'active',
add column if not exists last_activity_at timestamptz,
add column if not exists password_reset_requested_at timestamptz,
add column if not exists updated_at timestamptz not null default now();

alter table public.profiles
drop constraint if exists profiles_role_check,
add constraint profiles_role_check
check (role in ('admin', 'hospital', 'donor', 'support', 'viewer'));

alter table public.users
drop constraint if exists users_role_check,
add constraint users_role_check
check (role in ('admin', 'hospital', 'donor', 'support', 'viewer'));

alter table public.profiles
drop constraint if exists profiles_account_status_check,
add constraint profiles_account_status_check
check (account_status in ('active', 'suspended'));

alter table public.users
drop constraint if exists users_account_status_check,
add constraint users_account_status_check
check (account_status in ('active', 'suspended'));

create index if not exists profiles_account_status_idx
on public.profiles(account_status);

create index if not exists profiles_last_activity_idx
on public.profiles(last_activity_at desc);

update public.users u
set account_status = p.account_status,
    last_activity_at = coalesce(u.last_activity_at, p.last_activity_at),
    updated_at = now()
from public.profiles p
where p.auth_user_id = u.auth_user_id;
