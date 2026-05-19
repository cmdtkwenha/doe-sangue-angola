-- Angola healthcare reference datasets for production imports.

create table if not exists public.provinces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  province text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  facility_type text not null default 'Clínica',
  province text not null,
  municipality text not null,
  address text,
  contact text,
  email text,
  license_number text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.blood_banks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  province text not null,
  municipality text not null,
  address text,
  contact text,
  email text,
  license_number text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists provinces_name_ci_unique
  on public.provinces(lower(name));
create unique index if not exists municipalities_province_name_ci_unique
  on public.municipalities(lower(province), lower(name));
create unique index if not exists clinics_name_scope_ci_unique
  on public.clinics(lower(name), lower(province), lower(municipality));
create unique index if not exists blood_banks_name_scope_ci_unique
  on public.blood_banks(lower(name), lower(province), lower(municipality));

create index if not exists clinics_province_municipality_idx
  on public.clinics(province, municipality);
create index if not exists blood_banks_province_municipality_idx
  on public.blood_banks(province, municipality);

alter table public.provinces enable row level security;
alter table public.municipalities enable row level security;
alter table public.clinics enable row level security;
alter table public.blood_banks enable row level security;

drop policy if exists "Admins manage provinces" on public.provinces;
drop policy if exists "Admins manage municipalities" on public.municipalities;
drop policy if exists "Admins manage clinics" on public.clinics;
drop policy if exists "Admins manage blood banks" on public.blood_banks;
drop policy if exists "Authenticated read provinces" on public.provinces;
drop policy if exists "Authenticated read municipalities" on public.municipalities;
drop policy if exists "Authenticated read clinics" on public.clinics;
drop policy if exists "Authenticated read blood banks" on public.blood_banks;

create policy "Authenticated read provinces" on public.provinces
for select using (auth.uid() is not null);
create policy "Authenticated read municipalities" on public.municipalities
for select using (auth.uid() is not null);
create policy "Authenticated read clinics" on public.clinics
for select using (auth.uid() is not null);
create policy "Authenticated read blood banks" on public.blood_banks
for select using (auth.uid() is not null);

create policy "Admins manage provinces" on public.provinces
for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage municipalities" on public.municipalities
for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage clinics" on public.clinics
for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage blood banks" on public.blood_banks
for all using (public.is_admin()) with check (public.is_admin());
