-- Support hospital self-registration after pilot resets.
-- Safe migration: adds aliases used by the production onboarding form.

alter table public.hospitals
  add column if not exists status text not null default 'Pendente',
  add column if not exists hospital_type text,
  add column if not exists institutional_email text,
  add column if not exists responsible_person text;

create index if not exists hospitals_status_idx on public.hospitals(status);

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where auth_user_id = auth.uid() limit 1),
    (select role from public.users where auth_user_id = auth.uid() or id = auth.uid() limit 1)
  )
$$;

create or replace function public.current_profile_entity()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select linked_entity_id from public.profiles where auth_user_id = auth.uid() limit 1),
    (select linked_entity_id from public.users where auth_user_id = auth.uid() or id = auth.uid() limit 1)
  )
$$;

drop policy if exists "Hospitals self register pending institution" on public.hospitals;

create policy "Hospitals self register pending institution"
on public.hospitals
for insert
with check (
  public.current_profile_role() = 'hospital'
  and verified = false
  and coalesce(status, 'Pendente') = 'Pendente'
  and coalesce(verification_status, 'Pendente') = 'Pendente'
);
