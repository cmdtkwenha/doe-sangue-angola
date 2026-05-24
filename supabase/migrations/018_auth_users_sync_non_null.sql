-- Keeps public.users synchronized with auth.users without null names.
-- Safe for production: no data is dropped or truncated.

create extension if not exists pgcrypto with schema extensions;

alter table public.users add column if not exists auth_user_id uuid;
alter table public.users add column if not exists role text;
alter table public.users add column if not exists name text;
alter table public.users add column if not exists email text;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists created_at timestamptz not null default now();

update public.users
set name = coalesce(nullif(name, ''), split_part(email, '@', 1), 'Utilizador')
where name is null or name = '';

update public.users
set role = coalesce(nullif(role, ''), 'donor')
where role is null or role = '';

create or replace function public.safe_auth_name(metadata jsonb, email text)
returns text
language sql
stable
as $$
  select coalesce(
    nullif(metadata->>'full_name', ''),
    nullif(metadata->>'name', ''),
    nullif(split_part(email, '@', 1), ''),
    'Utilizador'
  );
$$;

create or replace function public.safe_auth_role(metadata jsonb)
returns text
language sql
stable
as $$
  select case
    when metadata->>'role' in ('admin', 'hospital', 'donor') then metadata->>'role'
    else 'donor'
  end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := public.safe_auth_role(new.raw_user_meta_data);
  requested_name text := public.safe_auth_name(new.raw_user_meta_data, new.email);
  profile_id uuid;
begin
  insert into public.users (auth_user_id, role, name, email)
  values (new.id, requested_role, requested_name, new.email)
  on conflict (email) do update
    set auth_user_id = excluded.auth_user_id,
        role = coalesce(excluded.role, public.users.role, 'donor'),
        name = coalesce(nullif(excluded.name, ''), public.users.name, 'Utilizador')
  returning id into profile_id;

  insert into public.profiles (auth_user_id, role, name, email)
  values (new.id, requested_role, requested_name, new.email)
  on conflict (auth_user_id) do update
    set role = coalesce(excluded.role, public.profiles.role, 'donor'),
        name = coalesce(nullif(excluded.name, ''), public.profiles.name, 'Utilizador'),
        email = excluded.email
  returning id into profile_id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
