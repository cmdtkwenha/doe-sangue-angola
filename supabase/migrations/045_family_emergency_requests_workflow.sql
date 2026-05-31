create extension if not exists pgcrypto with schema extensions;

create table if not exists public.family_emergency_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  patient_name text,
  requester_name text,
  hospital_location text,
  time_urgency text,
  units integer,
  contact_name text,
  contact_phone text,
  relationship text,
  hospital_name text,
  hospital_id uuid references public.hospitals(id) on delete set null,
  province text,
  municipality text,
  blood_type text,
  units_needed integer,
  urgency text,
  status text not null default 'pending_review',
  review_note text,
  blood_request_id uuid references public.blood_requests(id) on delete set null,
  share_token text not null unique default encode(extensions.gen_random_bytes(8), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.family_emergency_requests
  add column if not exists patient_name text,
  add column if not exists requester_name text,
  add column if not exists hospital_location text,
  add column if not exists time_urgency text,
  add column if not exists units integer,
  add column if not exists contact_name text,
  add column if not exists hospital_name text,
  add column if not exists hospital_id uuid references public.hospitals(id) on delete set null,
  add column if not exists province text,
  add column if not exists municipality text,
  add column if not exists units_needed integer,
  add column if not exists urgency text,
  add column if not exists review_note text,
  add column if not exists blood_request_id uuid references public.blood_requests(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

update public.family_emergency_requests
set patient_name = coalesce(patient_name, requester_name, 'Paciente'),
    contact_name = coalesce(contact_name, requester_name, 'Contacto familiar'),
    hospital_name = coalesce(hospital_name, hospital_location, 'Hospital a confirmar'),
    units_needed = coalesce(units_needed, units, 1),
    urgency = coalesce(urgency, time_urgency, 'Critica'),
    status = case status
      when 'Pendente' then 'pending_review'
      when 'Verificado' then 'approved'
      when 'Resolvido' then 'fulfilled'
      when 'Expirado' then 'cancelled'
      else coalesce(status, 'pending_review')
    end;

alter table public.family_emergency_requests
  alter column patient_name set not null,
  alter column contact_name set not null,
  alter column contact_phone set not null,
  alter column relationship set not null,
  alter column hospital_name set not null,
  alter column province set default 'Luanda',
  alter column municipality set default 'Luanda',
  alter column blood_type set not null,
  alter column units_needed set not null,
  alter column urgency set not null;

alter table public.family_emergency_requests
  drop constraint if exists family_emergency_status_check,
  add constraint family_emergency_status_check
    check (status in ('pending_review', 'approved', 'active', 'fulfilled', 'cancelled'));

alter table public.family_emergency_requests
  drop constraint if exists family_emergency_units_check,
  add constraint family_emergency_units_check check (units_needed > 0);

alter table public.blood_requests
  add column if not exists request_source text not null default 'hospital',
  add column if not exists family_request_id uuid references public.family_emergency_requests(id) on delete set null;

create index if not exists family_emergency_status_idx on public.family_emergency_requests(status);
create index if not exists family_emergency_province_idx on public.family_emergency_requests(province);
create index if not exists family_emergency_blood_request_idx on public.family_emergency_requests(blood_request_id);
create index if not exists blood_requests_source_idx on public.blood_requests(request_source);

alter table public.family_emergency_requests enable row level security;

grant insert on public.family_emergency_requests to anon, authenticated;
grant select, update on public.family_emergency_requests to authenticated;

drop policy if exists "Public submit family emergency" on public.family_emergency_requests;
create policy "Public submit family emergency" on public.family_emergency_requests
for insert with check (
  contact_phone is not null
  and hospital_name is not null
  and status = 'pending_review'
);

drop policy if exists "Admin manage family emergency" on public.family_emergency_requests;
create policy "Admin manage family emergency" on public.family_emergency_requests
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Donors read active family emergency" on public.family_emergency_requests;
create policy "Donors read active family emergency" on public.family_emergency_requests
for select using (
  status in ('approved', 'active')
  and exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role in ('donor', 'admin')
  )
);

drop policy if exists "Hospitals read family emergency" on public.family_emergency_requests;
create policy "Hospitals read family emergency" on public.family_emergency_requests
for select using (
  status in ('approved', 'active')
  and exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role in ('hospital', 'admin')
  )
);
