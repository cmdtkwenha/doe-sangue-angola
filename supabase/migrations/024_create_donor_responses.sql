-- Explicit donor response table for real donor PIN workflow.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.donor_responses (
  id uuid primary key default extensions.gen_random_uuid(),
  donor_id uuid not null references public.donors(id) on delete cascade,
  blood_request_id uuid not null references public.blood_requests(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  status text not null default 'accepted',
  eta_minutes integer default 15,
  confirmation_pin text not null,
  arrived_at timestamptz,
  donation_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.donor_responses
  add column if not exists updated_at timestamptz not null default now(),
  alter column status set default 'accepted',
  alter column eta_minutes set default 15;

alter table public.donor_responses
  drop constraint if exists donor_responses_status_check,
  add constraint donor_responses_status_check
  check (status in ('accepted', 'arrived', 'pin_validated', 'completed', 'cancelled'));

create unique index if not exists donor_responses_unique_donor_request
  on public.donor_responses(donor_id, blood_request_id);
create index if not exists donor_responses_donor_id_idx on public.donor_responses(donor_id);
create index if not exists donor_responses_hospital_id_idx on public.donor_responses(hospital_id);
create index if not exists donor_responses_blood_request_id_idx on public.donor_responses(blood_request_id);
create index if not exists donor_responses_status_idx on public.donor_responses(status);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists donor_responses_touch_updated_at on public.donor_responses;
create trigger donor_responses_touch_updated_at
before update on public.donor_responses
for each row execute function public.touch_updated_at();

create or replace function public.current_donor_id()
returns uuid language sql stable security definer set search_path = public as $$
  select d.id
  from public.donors d
  left join public.users u on u.id = d.user_id
  where d.user_id = auth.uid()
     or u.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_profile_entity()
returns uuid language sql stable security definer set search_path = public as $$
  select linked_entity_id from public.profiles where auth_user_id = auth.uid() limit 1
$$;

alter table public.donor_responses enable row level security;

drop policy if exists "Donor responses donor insert" on public.donor_responses;
create policy "Donor responses donor insert" on public.donor_responses
for insert with check (donor_id = public.current_donor_id());

drop policy if exists "Donor responses donor read" on public.donor_responses;
create policy "Donor responses donor read" on public.donor_responses
for select using (donor_id = public.current_donor_id());

drop policy if exists "Donor responses hospital read" on public.donor_responses;
create policy "Donor responses hospital read" on public.donor_responses
for select using (hospital_id = public.current_profile_entity());

drop policy if exists "Donor responses hospital update" on public.donor_responses;
create policy "Donor responses hospital update" on public.donor_responses
for update using (hospital_id = public.current_profile_entity())
with check (hospital_id = public.current_profile_entity());

drop policy if exists "Donor responses admin all" on public.donor_responses;
create policy "Donor responses admin all" on public.donor_responses
for all using (public.is_admin()) with check (public.is_admin());

alter table public.donor_responses replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'donor_responses'
  ) then
    alter publication supabase_realtime add table public.donor_responses;
  end if;
exception
  when undefined_object then null;
end $$;
