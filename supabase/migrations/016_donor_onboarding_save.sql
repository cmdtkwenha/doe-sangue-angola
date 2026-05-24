-- Production-safe donor onboarding columns and owner policies.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.donors (
  id uuid primary key default extensions.gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  user_id uuid,
  full_name text,
  email text,
  phone text,
  blood_type text,
  province text,
  municipality text,
  birth_date date,
  gender text,
  last_donation date,
  last_donation_date date,
  total_donations integer not null default 0,
  eligibility_status text not null default 'Pendente',
  available boolean not null default true,
  points integer not null default 0,
  preferred_hospital_id uuid,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz not null default now()
);

alter table public.donors add column if not exists auth_user_id uuid;
alter table public.donors add column if not exists user_id uuid;
alter table public.donors add column if not exists full_name text;
alter table public.donors add column if not exists email text;
alter table public.donors add column if not exists phone text;
alter table public.donors add column if not exists blood_type text;
alter table public.donors add column if not exists province text;
alter table public.donors add column if not exists municipality text;
alter table public.donors add column if not exists birth_date date;
alter table public.donors add column if not exists gender text;
alter table public.donors add column if not exists last_donation date;
alter table public.donors add column if not exists last_donation_date date;
alter table public.donors add column if not exists total_donations integer not null default 0;
alter table public.donors add column if not exists eligibility_status text not null default 'Pendente';
alter table public.donors add column if not exists available boolean not null default true;
alter table public.donors add column if not exists points integer not null default 0;
alter table public.donors add column if not exists preferred_hospital_id uuid;
alter table public.donors add column if not exists emergency_contact_name text;
alter table public.donors add column if not exists emergency_contact_phone text;
alter table public.donors add column if not exists created_at timestamptz not null default now();

create unique index if not exists donors_auth_user_id_unique_idx
  on public.donors(auth_user_id)
  where auth_user_id is not null;
create index if not exists donors_user_id_idx on public.donors(user_id);
create index if not exists donors_blood_province_idx on public.donors(blood_type, province);

alter table public.donors enable row level security;

drop policy if exists "Donor onboarding owner select" on public.donors;
drop policy if exists "Donor onboarding owner insert" on public.donors;
drop policy if exists "Donor onboarding owner update" on public.donors;

create policy "Donor onboarding owner select" on public.donors
for select using (
  auth_user_id = auth.uid()
  or id = public.current_profile_entity()
  or public.is_admin()
);

create policy "Donor onboarding owner insert" on public.donors
for insert with check (
  auth_user_id = auth.uid()
  or public.is_admin()
);

create policy "Donor onboarding owner update" on public.donors
for update using (
  auth_user_id = auth.uid()
  or id = public.current_profile_entity()
  or public.is_admin()
) with check (
  auth_user_id = auth.uid()
  or id = public.current_profile_entity()
  or public.is_admin()
);
