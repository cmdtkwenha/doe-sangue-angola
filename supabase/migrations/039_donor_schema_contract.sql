-- Consolidated donor schema contract used by web, mobile and workflow APIs.

alter table public.donors
add column if not exists user_id uuid,
add column if not exists blood_type text,
add column if not exists province text,
add column if not exists municipality text,
add column if not exists birth_date date,
add column if not exists gender text,
add column if not exists last_donation date,
add column if not exists last_donation_date date,
add column if not exists available boolean not null default true,
add column if not exists points integer not null default 0,
add column if not exists preferred_hospital_id uuid,
add column if not exists emergency_contact_name text,
add column if not exists emergency_contact_phone text,
add column if not exists consent_accepted_at timestamptz,
add column if not exists consent_version text,
add column if not exists privacy_policy_version text,
add column if not exists medical_disclaimer_version text,
add column if not exists reliability_score integer not null default 7,
add column if not exists response_speed_minutes integer not null default 60,
add column if not exists next_eligible_donation_date timestamptz,
add column if not exists latitude double precision,
add column if not exists longitude double precision,
add column if not exists location_permission_status text not null default 'unknown',
add column if not exists created_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'donors'
      and column_name = 'next_eligible_donation_date'
      and data_type <> 'timestamp with time zone'
  ) then
    alter table public.donors
    alter column next_eligible_donation_date type timestamptz
    using next_eligible_donation_date::timestamptz;
  end if;
end $$;

create index if not exists donors_user_id_contract_idx on public.donors(user_id);
create index if not exists donors_blood_province_idx on public.donors(blood_type, province);
create index if not exists donors_location_idx
  on public.donors(latitude, longitude)
  where latitude is not null and longitude is not null;
