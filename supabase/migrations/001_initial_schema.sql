-- Doe Sangue Angola initial Supabase schema.
-- Mock data remains in the app until backend mode is deliberately enabled.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.users (
  id uuid primary key default extensions.gen_random_uuid(),
  auth_user_id uuid unique,
  role text not null check (role in ('admin', 'hospital', 'donor')),
  name text not null,
  email text unique not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.hospitals (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  name text not null,
  province text not null,
  municipality text not null,
  verified boolean not null default false,
  capacity integer not null default 0,
  contact text,
  created_at timestamptz not null default now()
);

create table if not exists public.donors (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  blood_type text not null,
  province text not null,
  municipality text not null,
  available boolean not null default true,
  last_donation date,
  points integer not null default 0,
  preferred_hospital_id uuid references public.hospitals(id),
  created_at timestamptz not null default now()
);

create table if not exists public.blood_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  patient_code text not null,
  blood_type text not null,
  units integer not null check (units > 0),
  urgency text not null check (urgency in ('Critica', 'Alta', 'Media', 'Normal')),
  status text not null default 'Aberto',
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default extensions.gen_random_uuid(),
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
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.rewards (
  id uuid primary key default extensions.gen_random_uuid(),
  donor_id uuid not null references public.donors(id) on delete cascade,
  points integer not null,
  reason text not null,
  tier text,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default extensions.gen_random_uuid(),
  referrer_donor_id uuid not null references public.donors(id) on delete cascade,
  invited_name text not null,
  status text not null default 'Pendente',
  reward_points integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.family_emergency_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  requester_name text not null,
  relationship text not null,
  contact_phone text not null,
  blood_type text not null,
  hospital_location text not null,
  units integer not null check (units > 0),
  time_urgency text not null,
  status text not null default 'Pendente',
  share_token text not null unique default encode(extensions.gen_random_bytes(8), 'hex'),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_user_id uuid references public.users(id) on delete set null,
  actor_label text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.fraud_reviews (
  id uuid primary key default extensions.gen_random_uuid(),
  blood_request_id uuid references public.blood_requests(id) on delete cascade,
  donor_id uuid references public.donors(id) on delete set null,
  risk text not null default 'baixo',
  status text not null default 'Pendente',
  flags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.users add column if not exists auth_user_id uuid unique;
alter table public.users add column if not exists role text;
alter table public.users add column if not exists name text;
alter table public.users add column if not exists email text;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists created_at timestamptz not null default now();

alter table public.hospitals add column if not exists user_id uuid references public.users(id) on delete set null;
alter table public.hospitals add column if not exists name text;
alter table public.hospitals add column if not exists province text;
alter table public.hospitals add column if not exists municipality text;
alter table public.hospitals add column if not exists verified boolean not null default false;
alter table public.hospitals add column if not exists capacity integer not null default 0;
alter table public.hospitals add column if not exists contact text;
alter table public.hospitals add column if not exists created_at timestamptz not null default now();

alter table public.donors add column if not exists user_id uuid references public.users(id) on delete cascade;
alter table public.donors add column if not exists blood_type text;
alter table public.donors add column if not exists province text;
alter table public.donors add column if not exists municipality text;
alter table public.donors add column if not exists available boolean not null default true;
alter table public.donors add column if not exists last_donation date;
alter table public.donors add column if not exists points integer not null default 0;
alter table public.donors add column if not exists preferred_hospital_id uuid references public.hospitals(id);
alter table public.donors add column if not exists created_at timestamptz not null default now();

alter table public.blood_requests add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade;
alter table public.blood_requests add column if not exists patient_code text;
alter table public.blood_requests add column if not exists blood_type text;
alter table public.blood_requests add column if not exists units integer;
alter table public.blood_requests add column if not exists urgency text;
alter table public.blood_requests add column if not exists status text not null default 'Aberto';
alter table public.blood_requests add column if not exists created_at timestamptz not null default now();

alter table public.users enable row level security;
alter table public.donors enable row level security;
alter table public.hospitals enable row level security;
alter table public.blood_requests enable row level security;
alter table public.appointments enable row level security;
alter table public.notifications enable row level security;
alter table public.rewards enable row level security;
alter table public.referrals enable row level security;
alter table public.family_emergency_requests enable row level security;
alter table public.audit_logs enable row level security;
alter table public.fraud_reviews enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users read own profile') then
    create policy "Authenticated users read own profile"
      on public.users for select using (auth.uid() = auth_user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users create own profile') then
    create policy "Authenticated users create own profile"
      on public.users for insert with check (auth.uid() = auth_user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Public can read verified hospitals') then
    create policy "Public can read verified hospitals"
      on public.hospitals for select using (verified = true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Donors read own donor row') then
    create policy "Donors read own donor row" on public.donors for select using (
      user_id in (select id from public.users where auth_user_id = auth.uid())
    );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Hospitals manage own requests') then
    create policy "Hospitals manage own requests" on public.blood_requests for all using (
      hospital_id in (
        select h.id from public.hospitals h
        join public.users u on u.id = h.user_id
        where u.auth_user_id = auth.uid()
      )
    );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users create appointments') then
    create policy "Authenticated users create appointments"
      on public.appointments for insert with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users update appointments') then
    create policy "Authenticated users update appointments"
      on public.appointments for update using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users read own notifications') then
    create policy "Users read own notifications" on public.notifications for select using (
      user_id in (select id from public.users where auth_user_id = auth.uid())
    );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users create notifications') then
    create policy "Authenticated users create notifications"
      on public.notifications for insert with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users create rewards') then
    create policy "Authenticated users create rewards"
      on public.rewards for insert with check (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users create audit logs') then
    create policy "Authenticated users create audit logs"
      on public.audit_logs for insert with check (auth.uid() is not null);
  end if;
end $$;
