-- Real blood request management fields.

alter table public.blood_requests
  add column if not exists units_needed integer,
  add column if not exists province text,
  add column if not exists municipality text,
  add column if not exists notes text,
  add column if not exists created_by uuid references auth.users(id) on delete set null;

update public.blood_requests br
set units_needed = coalesce(br.units_needed, br.units),
    province = coalesce(br.province, h.province),
    municipality = coalesce(br.municipality, h.municipality)
from public.hospitals h
where br.hospital_id = h.id;

alter table public.blood_requests
  alter column units_needed set default 1;

create index if not exists blood_requests_province_idx
  on public.blood_requests(province);
create index if not exists blood_requests_created_by_idx
  on public.blood_requests(created_by);
create index if not exists blood_requests_status_urgency_idx
  on public.blood_requests(status, urgency);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'blood_requests_units_needed_check'
  ) then
    alter table public.blood_requests
      add constraint blood_requests_units_needed_check
      check (units_needed is null or units_needed > 0);
  end if;
end $$;
