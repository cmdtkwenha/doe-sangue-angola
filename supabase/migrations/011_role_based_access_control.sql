-- Production RBAC profile model and role-aware helpers.

alter table public.profiles
  add column if not exists linked_entity_id uuid;

update public.profiles p
set linked_entity_id = h.id
from public.hospitals h
join public.users u on u.id = h.user_id
where p.role = 'hospital'
  and p.auth_user_id = u.auth_user_id
  and p.linked_entity_id is null;

update public.profiles p
set linked_entity_id = d.id
from public.donors d
where p.role = 'donor'
  and d.auth_user_id = p.auth_user_id
  and p.linked_entity_id is null;

create index if not exists profiles_linked_entity_idx
  on public.profiles(linked_entity_id);

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.current_linked_entity_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select linked_entity_id from public.profiles where auth_user_id = auth.uid() limit 1
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

create or replace function public.owns_hospital(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or (
    public.current_app_role() = 'hospital'
    and public.current_linked_entity_id() = target
  )
$$;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Admins read all profiles') then
    create policy "Admins read all profiles" on public.profiles
      for select using (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins read all hospitals rbac') then
    create policy "Admins read all hospitals rbac" on public.hospitals
      for select using (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins read all requests rbac') then
    create policy "Admins read all requests rbac" on public.blood_requests
      for select using (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins read all donors rbac') then
    create policy "Admins read all donors rbac" on public.donors
      for select using (public.is_admin());
  end if;
end $$;
