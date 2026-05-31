create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.users (
  id uuid primary key default extensions.gen_random_uuid(),
  auth_user_id uuid unique,
  role text not null default 'donor',
  name text not null default 'Utilizador',
  email text unique not null,
  phone text,
  linked_entity_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default extensions.gen_random_uuid(),
  auth_user_id uuid unique,
  role text not null default 'donor',
  linked_entity_id uuid,
  name text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.users
add column if not exists auth_user_id uuid,
add column if not exists role text not null default 'donor',
add column if not exists phone text,
add column if not exists linked_entity_id uuid,
add column if not exists created_at timestamptz not null default now();

alter table public.profiles
add column if not exists auth_user_id uuid,
add column if not exists role text not null default 'donor',
add column if not exists linked_entity_id uuid,
add column if not exists name text,
add column if not exists email text,
add column if not exists created_at timestamptz not null default now();

alter table public.hospitals
add column if not exists address text,
add column if not exists contact text,
add column if not exists email text,
add column if not exists facility_type text,
add column if not exists license_number text,
add column if not exists phone text,
add column if not exists latitude double precision,
add column if not exists longitude double precision;

alter table public.blood_requests
add column if not exists created_by uuid,
add column if not exists patient_code text,
add column if not exists units integer not null default 1,
add column if not exists units_needed integer not null default 1,
add column if not exists province text,
add column if not exists municipality text,
add column if not exists notes text,
add column if not exists urgency text not null default 'Normal';

alter table public.appointments
add column if not exists blood_request_id uuid,
add column if not exists date date,
add column if not exists time text,
add column if not exists pin text,
add column if not exists status text not null default 'Pendente';

create table if not exists public.donor_responses (
  id uuid primary key default extensions.gen_random_uuid(),
  donor_id uuid not null,
  blood_request_id uuid not null,
  hospital_id uuid not null,
  status text not null default 'accepted',
  eta_minutes integer default 15,
  confirmation_pin text not null,
  accepted_at timestamptz default now(),
  arrived_at timestamptz,
  pin_validated_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  donation_completed_at timestamptz,
  pin_expires_at timestamptz,
  pin_locked_until timestamptz,
  failed_pin_attempts integer not null default 0,
  reward_accepted_at timestamptz,
  reward_arrived_at timestamptz,
  reward_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.donor_responses
add column if not exists eta_minutes integer default 15,
add column if not exists confirmation_pin text,
add column if not exists accepted_at timestamptz default now(),
add column if not exists arrived_at timestamptz,
add column if not exists pin_validated_at timestamptz,
add column if not exists cancelled_at timestamptz,
add column if not exists completed_at timestamptz,
add column if not exists donation_completed_at timestamptz,
add column if not exists pin_expires_at timestamptz,
add column if not exists pin_locked_until timestamptz,
add column if not exists failed_pin_attempts integer not null default 0,
add column if not exists reward_accepted_at timestamptz,
add column if not exists reward_arrived_at timestamptz,
add column if not exists reward_completed_at timestamptz,
add column if not exists updated_at timestamptz not null default now();

create unique index if not exists donor_responses_donor_request_unique_idx
on public.donor_responses(donor_id, blood_request_id);
create index if not exists donor_responses_hospital_idx on public.donor_responses(hospital_id);
create index if not exists donor_responses_status_idx on public.donor_responses(status);

create table if not exists public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid,
  role text,
  title text not null,
  body text,
  message text,
  type text not null default 'system',
  read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications
add column if not exists role text,
add column if not exists body text,
add column if not exists message text,
add column if not exists read boolean not null default false,
add column if not exists read_at timestamptz;

create table if not exists public.push_tokens (
  id uuid primary key default extensions.gen_random_uuid(),
  donor_id uuid not null,
  platform text not null default 'unknown',
  token text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  id uuid primary key default extensions.gen_random_uuid(),
  donor_id uuid not null unique,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.hospital_inventory (
  id uuid primary key default extensions.gen_random_uuid(),
  hospital_id uuid not null,
  blood_type text not null,
  units_available integer not null default 0,
  daily_usage_estimate numeric not null default 1,
  safe_minimum integer not null default 5,
  updated_at timestamptz not null default now()
);

create table if not exists public.support_issues (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid,
  role text not null,
  page text not null,
  action text not null,
  type text not null,
  severity text not null default 'Média',
  message text not null,
  status text not null default 'Aberto',
  created_at timestamptz not null default now()
);

create table if not exists public.provinces (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null unique
);
create table if not exists public.municipalities (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  province text not null
);
create table if not exists public.clinics (like public.hospitals including defaults);
create table if not exists public.blood_banks (like public.hospitals including defaults);

alter table public.clinics
add column if not exists name text,
add column if not exists province text,
add column if not exists municipality text,
add column if not exists address text,
add column if not exists contact text,
add column if not exists email text,
add column if not exists facility_type text,
add column if not exists license_number text,
add column if not exists verified boolean not null default false;

alter table public.blood_banks
add column if not exists name text,
add column if not exists province text,
add column if not exists municipality text,
add column if not exists address text,
add column if not exists contact text,
add column if not exists email text,
add column if not exists facility_type text,
add column if not exists license_number text,
add column if not exists verified boolean not null default false;

alter table public.rewards
add column if not exists tier text,
add column if not exists created_at timestamptz not null default now();

alter table public.audit_logs
add column if not exists actor_label text not null default 'Sistema',
add column if not exists action text not null default 'Evento registado',
add column if not exists created_at timestamptz not null default now();

alter table public.fraud_reviews
add column if not exists risk text not null default 'baixo',
add column if not exists status text not null default 'Pendente',
add column if not exists created_at timestamptz not null default now();

alter table public.legal_consents enable row level security;
alter table public.donor_responses enable row level security;
alter table public.notifications enable row level security;
