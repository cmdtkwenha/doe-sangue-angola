-- Real Angola hospitals/clinics dataset support.

alter table public.hospitals
  add column if not exists facility_type text,
  add column if not exists address text,
  add column if not exists email text,
  add column if not exists license_number text;

update public.hospitals
set facility_type = coalesce(facility_type, 'Hospital')
where facility_type is null;

alter table public.hospitals
  alter column facility_type set not null;

drop index if exists hospitals_name_province_unique;
drop index if exists hospitals_name_province_ci_unique;

create unique index if not exists hospitals_name_province_municipality_unique
  on public.hospitals(name, province, municipality);

create unique index if not exists hospitals_name_province_municipality_ci_unique
  on public.hospitals(lower(name), lower(province), lower(municipality));

create unique index if not exists hospitals_license_unique
  on public.hospitals(license_number)
  where license_number is not null and license_number <> '';

create index if not exists hospitals_verified_idx on public.hospitals(verified);
create index if not exists hospitals_province_municipality_idx
  on public.hospitals(province, municipality);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'hospitals_email_format_check'
  ) then
    alter table public.hospitals
      add constraint hospitals_email_format_check
      check (email is null or email = '' or email like '%@%');
  end if;
end $$;
