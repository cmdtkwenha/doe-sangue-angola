-- Repairs Supabase Auth signup trigger.
-- Safe for production: no existing rows are dropped or truncated.

create extension if not exists pgcrypto with schema extensions;

alter table public.users add column if not exists auth_user_id uuid;
alter table public.users add column if not exists role text;
alter table public.users add column if not exists name text;
alter table public.users add column if not exists email text;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists auth_user_id uuid;
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

update public.users
set email = coalesce(nullif(email, ''), id::text || '@auth.local')
where email is null or email = '';

update public.users
set name = coalesce(nullif(name, ''), split_part(email, '@', 1), 'Utilizador')
where name is null or name = '';

update public.users
set role = case when role in ('admin', 'hospital', 'donor') then role else 'donor' end
where role is null or role not in ('admin', 'hospital', 'donor');

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  effective_email text := coalesce(nullif(new.email, ''), new.id::text || '@auth.local');
  requested_name text := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(split_part(effective_email, '@', 1), ''),
    'Utilizador'
  );
  requested_role text := case
    when new.raw_user_meta_data->>'role' in ('admin', 'hospital', 'donor')
      then new.raw_user_meta_data->>'role'
    else 'donor'
  end;
  profile_row_id uuid;
begin
  update public.users
  set auth_user_id = new.id,
      email = effective_email,
      name = requested_name,
      role = requested_role
  where auth_user_id = new.id;

  if not found then
    update public.users
    set auth_user_id = new.id,
        name = requested_name,
        role = requested_role
    where email = effective_email;
  end if;

  if not found then
    insert into public.users (id, auth_user_id, name, email, role, created_at)
    values (new.id, new.id, requested_name, effective_email, requested_role, now());
  end if;

  update public.profiles
  set auth_user_id = new.id,
      email = effective_email,
      name = requested_name,
      role = requested_role,
      updated_at = now()
  where auth_user_id = new.id
  returning id into profile_row_id;

  if profile_row_id is null then
    update public.profiles
    set auth_user_id = new.id,
        name = requested_name,
        role = requested_role,
        updated_at = now()
    where email = effective_email
    returning id into profile_row_id;
  end if;

  if profile_row_id is null then
    insert into public.profiles (id, auth_user_id, role, name, email, created_at, updated_at)
    values (new.id, new.id, requested_role, requested_name, effective_email, now(), now());
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_profile on auth.users;
drop trigger if exists handle_new_user on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
