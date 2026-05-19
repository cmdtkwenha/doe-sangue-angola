-- Real role source linked to Supabase Auth.
-- public.users remains for existing app relationships; public.profiles owns access roles.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'hospital', 'donor')),
  name text not null,
  email text unique not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.profiles (id, auth_user_id, role, name, email, phone)
select
  coalesce(u.id, au.id),
  au.id,
  coalesce(u.role, au.raw_user_meta_data->>'role', 'donor'),
  coalesce(u.name, au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  au.email,
  u.phone
from auth.users au
left join public.users u on u.email = au.email
where au.email is not null
on conflict (email) do update
set auth_user_id = excluded.auth_user_id,
    role = excluded.role,
    name = excluded.name,
    phone = excluded.phone,
    updated_at = now();

update public.profiles
set role = 'admin', updated_at = now()
where email = 'admin@sangueangola.ao';

update public.users u
set auth_user_id = p.auth_user_id,
    role = p.role,
    name = p.name,
    phone = coalesce(p.phone, u.phone)
from public.profiles p
where u.email = p.email;

alter table public.profiles enable row level security;

create index if not exists profiles_auth_user_id_idx on public.profiles(auth_user_id);
create index if not exists profiles_role_idx on public.profiles(role);

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where auth_user_id = auth.uid() limit 1),
    (select role from public.users where auth_user_id = auth.uid() limit 1)
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'admin'
$$;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Profiles read own or admin') then
    create policy "Profiles read own or admin" on public.profiles
      for select using (auth_user_id = auth.uid() or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Profiles create own') then
    create policy "Profiles create own" on public.profiles
      for insert with check (auth_user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Profiles update own or admin') then
    create policy "Profiles update own or admin" on public.profiles
      for update using (auth_user_id = auth.uid() or public.is_admin())
      with check (auth_user_id = auth.uid() or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins read hospitals real') then
    create policy "Admins read hospitals real" on public.hospitals
      for select using (public.is_admin());
  end if;
end $$;
