-- Donor onboarding fields for real mobile profiles.

alter table public.donors
  add column if not exists birth_date date;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'donors_user_id_unique'
  ) then
    alter table public.donors
      add constraint donors_user_id_unique unique (user_id);
  end if;
end $$;
