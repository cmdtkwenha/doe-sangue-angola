alter table public.donors
add column if not exists next_eligible_donation_date timestamptz,
add column if not exists reliability_score integer not null default 7,
add column if not exists response_speed_minutes integer not null default 60,
add column if not exists total_donations integer not null default 0,
add column if not exists last_donation_date date,
add column if not exists eligibility_status text not null default 'Pendente',
add column if not exists emergency_contact_name text,
add column if not exists emergency_contact_phone text,
add column if not exists consent_accepted_at timestamptz,
add column if not exists consent_version text,
add column if not exists privacy_policy_version text,
add column if not exists medical_disclaimer_version text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
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
