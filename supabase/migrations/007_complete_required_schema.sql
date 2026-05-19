-- Idempotent production schema guard for Doe Sangue Angola.
-- Safe to run after older migrations or against a fresh empty Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'hospital', 'donor')),
  name text not null,
  email text unique not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  name text not null,
  facility_type text not null default 'Hospital',
  province text not null,
  municipality text not null,
  address text,
  contact text,
  email text,
  license_number text,
  verified boolean not null default false,
  capacity integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.donors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete cascade,
  blood_type text not null,
  province text not null,
  municipality text not null,
  birth_date date,
  available boolean not null default true,
  last_donation date,
  points integer not null default 0,
  preferred_hospital_id uuid references public.hospitals(id),
  created_at timestamptz not null default now()
);

create table if not exists public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  patient_code text not null,
  blood_type text not null,
  units integer not null check (units > 0),
  urgency text not null check (urgency in ('Critica', 'Alta', 'Media', 'Normal')),
  status text not null default 'Aberto',
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donors(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  blood_request_id uuid references public.blood_requests(id) on delete set null,
  date date not null,
  time text not null,
  pin text not null,
  status text not null default 'Pendente',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donors(id) on delete cascade,
  points integer not null,
  reason text not null,
  tier text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id) on delete set null,
  actor_label text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.fraud_reviews (
  id uuid primary key default gen_random_uuid(),
  blood_request_id uuid references public.blood_requests(id) on delete cascade,
  donor_id uuid references public.donors(id) on delete set null,
  risk text not null default 'baixo',
  status text not null default 'Pendente',
  flags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.hospitals add column if not exists facility_type text;
alter table public.hospitals add column if not exists address text;
alter table public.hospitals add column if not exists email text;
alter table public.hospitals add column if not exists license_number text;
alter table public.donors add column if not exists birth_date date;

update public.hospitals
set facility_type = coalesce(facility_type, 'Hospital')
where facility_type is null;

alter table public.hospitals alter column facility_type set not null;

create unique index if not exists hospitals_name_province_municipality_ci_unique
  on public.hospitals(lower(name), lower(province), lower(municipality));
create unique index if not exists hospitals_name_province_municipality_unique
  on public.hospitals(name, province, municipality);
create unique index if not exists hospitals_license_unique
  on public.hospitals(license_number)
  where license_number is not null and license_number <> '';
create index if not exists hospitals_verified_idx on public.hospitals(verified);
create index if not exists hospitals_province_municipality_idx
  on public.hospitals(province, municipality);
create index if not exists users_auth_user_id_idx on public.users(auth_user_id);
create index if not exists users_role_idx on public.users(role);
create index if not exists donors_blood_type_idx on public.donors(blood_type);
create index if not exists blood_requests_hospital_status_idx
  on public.blood_requests(hospital_id, status);
create index if not exists appointments_request_idx on public.appointments(blood_request_id);
create index if not exists notifications_user_read_idx on public.notifications(user_id, read);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);

alter table public.users enable row level security;
alter table public.donors enable row level security;
alter table public.hospitals enable row level security;
alter table public.blood_requests enable row level security;
alter table public.appointments enable row level security;
alter table public.notifications enable row level security;
alter table public.rewards enable row level security;
alter table public.audit_logs enable row level security;
alter table public.fraud_reviews enable row level security;

create or replace function public.current_user_row_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.users where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.current_app_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.users where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_app_role() = 'admin'
$$;

create or replace function public.owns_hospital(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.hospitals
    where id = target and user_id = public.current_user_row_id()
  )
$$;

create or replace function public.current_donor_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.donors where user_id = public.current_user_row_id() limit 1
$$;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Users read own profile') then
    create policy "Users read own profile" on public.users
      for select using (id = public.current_user_row_id() or public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users create own profile') then
    create policy "Users create own profile" on public.users
      for insert with check (auth.uid() = auth_user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Public read verified hospitals') then
    create policy "Public read verified hospitals" on public.hospitals
      for select using (verified = true or public.is_admin() or user_id = public.current_user_row_id());
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Admins manage hospitals') then
    create policy "Admins manage hospitals" on public.hospitals
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Donors manage own donor row') then
    create policy "Donors manage own donor row" on public.donors
      for all using (user_id = public.current_user_row_id())
      with check (user_id = public.current_user_row_id());
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Admins read donors') then
    create policy "Admins read donors" on public.donors for select using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Requests role read') then
    create policy "Requests role read" on public.blood_requests for select using (
      public.is_admin() or public.owns_hospital(hospital_id)
      or public.current_app_role() = 'donor'
    );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Hospitals manage own requests') then
    create policy "Hospitals manage own requests" on public.blood_requests
      for all using (public.owns_hospital(hospital_id))
      with check (public.owns_hospital(hospital_id));
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Appointments role access') then
    create policy "Appointments role access" on public.appointments for all using (
      public.is_admin() or public.owns_hospital(hospital_id)
      or donor_id = public.current_donor_id()
    ) with check (
      public.is_admin() or public.owns_hospital(hospital_id)
      or donor_id = public.current_donor_id()
    );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users manage own notifications') then
    create policy "Users manage own notifications" on public.notifications for all
      using (user_id = public.current_user_row_id() or public.is_admin())
      with check (user_id = public.current_user_row_id() or public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Rewards role read') then
    create policy "Rewards role read" on public.rewards for select
      using (donor_id = public.current_donor_id() or public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Authenticated create rewards') then
    create policy "Authenticated create rewards" on public.rewards
      for insert with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Admins read audit logs v2') then
    create policy "Admins read audit logs v2" on public.audit_logs for select using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Admins manage fraud reviews') then
    create policy "Admins manage fraud reviews" on public.fraud_reviews
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Authenticated create audit logs') then
    create policy "Authenticated create audit logs" on public.audit_logs
      for insert with check (auth.uid() is not null);
  end if;
end $$;
