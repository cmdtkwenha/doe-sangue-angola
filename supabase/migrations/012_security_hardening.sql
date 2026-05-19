-- Production security hardening for Supabase Auth + RLS.
-- Apply after profile, donor, hospital and request migrations.

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.current_profile_entity()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select linked_entity_id from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.current_donor_province()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select province from public.donors where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'admin', false)
$$;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.donors enable row level security;
alter table public.donors force row level security;
alter table public.hospitals enable row level security;
alter table public.hospitals force row level security;
alter table public.blood_requests enable row level security;
alter table public.blood_requests force row level security;

drop policy if exists "Users manage own profile" on public.profiles;
drop policy if exists "Admins read all profiles" on public.profiles;
drop policy if exists "Admins manage profiles" on public.profiles;
drop policy if exists "Profiles owner read" on public.profiles;
drop policy if exists "Profiles owner insert" on public.profiles;
drop policy if exists "Profiles owner update" on public.profiles;
drop policy if exists "Profiles admin all" on public.profiles;

create policy "Profiles owner read" on public.profiles
for select using (auth_user_id = auth.uid() or public.is_admin());

create policy "Profiles owner insert" on public.profiles
for insert with check (auth_user_id = auth.uid() or public.is_admin());

create policy "Profiles owner update" on public.profiles
for update using (auth_user_id = auth.uid() or public.is_admin())
with check (auth_user_id = auth.uid() or public.is_admin());

create policy "Profiles admin all" on public.profiles
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins read all donors" on public.donors;
drop policy if exists "Admins read all donors rbac" on public.donors;
drop policy if exists "Donors update own donor row" on public.donors;
drop policy if exists "Donors manage own donor auth row" on public.donors;
drop policy if exists "Donors can read own profile" on public.donors;
drop policy if exists "Donors owner all" on public.donors;
drop policy if exists "Donors admin all" on public.donors;

create policy "Donors owner all" on public.donors
for all
using (public.is_admin() or auth_user_id = auth.uid() or id = public.current_profile_entity())
with check (public.is_admin() or auth_user_id = auth.uid() or id = public.current_profile_entity());

create policy "Donors admin all" on public.donors
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read verified hospitals" on public.hospitals;
drop policy if exists "Admins manage hospitals" on public.hospitals;
drop policy if exists "Admins read all hospitals rbac" on public.hospitals;
drop policy if exists "Hospitals read own hospital" on public.hospitals;
drop policy if exists "Hospitals update own hospital" on public.hospitals;
drop policy if exists "Hospitals owner read" on public.hospitals;
drop policy if exists "Hospitals owner update" on public.hospitals;
drop policy if exists "Hospitals admin all" on public.hospitals;

create policy "Hospitals owner read" on public.hospitals
for select using (public.is_admin() or id = public.current_profile_entity());

create policy "Hospitals owner update" on public.hospitals
for update using (public.is_admin() or id = public.current_profile_entity())
with check (public.is_admin() or id = public.current_profile_entity());

create policy "Hospitals admin all" on public.hospitals
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins read all requests" on public.blood_requests;
drop policy if exists "Admins read all requests rbac" on public.blood_requests;
drop policy if exists "Hospitals create own requests" on public.blood_requests;
drop policy if exists "Hospitals manage own requests" on public.blood_requests;
drop policy if exists "Donors read compatible open requests" on public.blood_requests;
drop policy if exists "Requests admin all" on public.blood_requests;
drop policy if exists "Requests hospital all own" on public.blood_requests;
drop policy if exists "Requests donor read nearby open" on public.blood_requests;

create policy "Requests admin all" on public.blood_requests
for all using (public.is_admin()) with check (public.is_admin());

create policy "Requests hospital all own" on public.blood_requests
for all
using (
  public.current_profile_role() = 'hospital'
  and hospital_id = public.current_profile_entity()
)
with check (
  public.current_profile_role() = 'hospital'
  and hospital_id = public.current_profile_entity()
);

create policy "Requests donor read nearby open" on public.blood_requests
for select using (
  public.current_profile_role() = 'donor'
  and status in ('Aberto', 'Em Correspondência')
  and (province is null or province = public.current_donor_province())
);

create index if not exists profiles_auth_role_idx on public.profiles(auth_user_id, role);
create index if not exists blood_requests_scope_idx
  on public.blood_requests(hospital_id, status, province, created_at desc);
