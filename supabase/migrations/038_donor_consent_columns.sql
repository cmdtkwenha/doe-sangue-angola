alter table public.donors
add column if not exists consent_accepted_at timestamptz,
add column if not exists consent_version text,
add column if not exists privacy_policy_version text,
add column if not exists medical_disclaimer_version text;
