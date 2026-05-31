-- Hospital settings, operational contacts, and staff access.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

alter table public.hospitals
add column if not exists main_contact_person text,
add column if not exists operational_phone text,
add column if not exists operational_email text,
add column if not exists emergency_contact text,
add column if not exists operating_hours text;

create table if not exists public.hospital_notification_preferences (
  id uuid primary key default extensions.gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(hospital_id)
);

create table if not exists public.hospital_staff (
  id uuid primary key default extensions.gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  auth_user_id uuid,
  name text not null,
  email text not null,
  staff_role text not null default 'operador',
  status text not null default 'invited',
  invited_by uuid,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(hospital_id, email)
);

alter table public.hospital_staff
add column if not exists auth_user_id uuid,
add column if not exists staff_role text not null default 'operador',
add column if not exists status text not null default 'invited',
add column if not exists invited_by uuid,
add column if not exists last_activity_at timestamptz,
add column if not exists updated_at timestamptz not null default now();

alter table public.hospital_staff
drop constraint if exists hospital_staff_role_check,
add constraint hospital_staff_role_check
check (staff_role in ('gestor', 'operador', 'observador'));

alter table public.hospital_staff
drop constraint if exists hospital_staff_status_check,
add constraint hospital_staff_status_check
check (status in ('invited', 'active', 'inactive'));

create index if not exists hospital_staff_hospital_idx on public.hospital_staff(hospital_id);
create index if not exists hospital_staff_email_idx on public.hospital_staff(lower(email));

alter table public.hospital_notification_preferences enable row level security;
alter table public.hospital_staff enable row level security;

drop policy if exists "Hospital preferences own read" on public.hospital_notification_preferences;
create policy "Hospital preferences own read" on public.hospital_notification_preferences
for select using (public.is_admin() or hospital_id = public.current_profile_entity());

drop policy if exists "Hospital preferences own write" on public.hospital_notification_preferences;
create policy "Hospital preferences own write" on public.hospital_notification_preferences
for all using (public.is_admin() or hospital_id = public.current_profile_entity())
with check (public.is_admin() or hospital_id = public.current_profile_entity());

drop policy if exists "Hospital staff own read" on public.hospital_staff;
create policy "Hospital staff own read" on public.hospital_staff
for select using (public.is_admin() or hospital_id = public.current_profile_entity());

drop policy if exists "Hospital staff own write" on public.hospital_staff;
create policy "Hospital staff own write" on public.hospital_staff
for all using (public.is_admin() or hospital_id = public.current_profile_entity())
with check (public.is_admin() or hospital_id = public.current_profile_entity());
