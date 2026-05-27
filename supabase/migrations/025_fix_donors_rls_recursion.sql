-- Repairs recursive donor RLS policies without touching donor data.

alter table public.donors enable row level security;

drop policy if exists "Donors read own donor row" on public.donors;
drop policy if exists "Donors manage own donor row" on public.donors;
drop policy if exists "Donors update own donor row" on public.donors;
drop policy if exists "Donors manage own donor auth row" on public.donors;
drop policy if exists "Donors can read own profile" on public.donors;
drop policy if exists "Donors owner all" on public.donors;
drop policy if exists "Donors admin all" on public.donors;
drop policy if exists "Donor onboarding owner select" on public.donors;
drop policy if exists "Donor onboarding owner insert" on public.donors;
drop policy if exists "Donor onboarding owner update" on public.donors;
drop policy if exists "Admins read donors" on public.donors;
drop policy if exists "Admins read all donors" on public.donors;
drop policy if exists "Admins read all donors rbac" on public.donors;
drop policy if exists "Hospitals read accepted donor rows" on public.donors;

create or replace function public.is_current_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role = 'admin'
  )
$$;

create or replace function public.current_hospital_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.linked_entity_id
  from public.profiles p
  where p.auth_user_id = auth.uid()
    and p.role = 'hospital'
  limit 1
$$;

create or replace function public.hospital_can_read_donor(target_donor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.donor_responses dr
    where dr.donor_id = target_donor_id
      and dr.hospital_id = public.current_hospital_id()
  )
$$;

create policy "Donors select own row" on public.donors
for select using (user_id = auth.uid());

create policy "Donors insert own row" on public.donors
for insert with check (user_id = auth.uid());

create policy "Donors update own row" on public.donors
for update using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Admins manage donors" on public.donors
for all using (public.is_current_admin())
with check (public.is_current_admin());

create policy "Hospitals read accepted donors" on public.donors
for select using (public.hospital_can_read_donor(id));
