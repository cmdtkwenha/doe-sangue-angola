-- Location fields for nearest request and ETA calculations.

alter table public.hospitals
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table public.donors
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_permission_status text not null default 'unknown';

create index if not exists hospitals_location_idx
  on public.hospitals(latitude, longitude)
  where latitude is not null and longitude is not null;

create index if not exists donors_location_idx
  on public.donors(latitude, longitude)
  where latitude is not null and longitude is not null;
