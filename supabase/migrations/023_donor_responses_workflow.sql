-- Real donor PIN workflow for donor app and hospital dashboard.

create or replace function public.current_donor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select d.id
  from public.donors d
  left join public.users u on u.id = d.user_id
  where d.user_id = auth.uid()
     or u.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_profile_entity()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select linked_entity_id from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create table if not exists public.donor_responses (
  id uuid primary key default extensions.gen_random_uuid(),
  donor_id uuid not null references public.donors(id) on delete cascade,
  blood_request_id uuid not null references public.blood_requests(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  status text not null default 'accepted',
  eta_minutes integer not null default 30,
  confirmation_pin text not null,
  arrived_at timestamptz,
  donation_completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (donor_id, blood_request_id),
  check (confirmation_pin ~ '^[0-9]{4}$'),
  check (status in ('accepted', 'arrived', 'pin_validated', 'completed', 'cancelled'))
);

alter table public.donor_responses
  drop constraint if exists donor_responses_status_check;

alter table public.donor_responses
  add constraint donor_responses_status_check
  check (status in ('accepted', 'arrived', 'pin_validated', 'completed', 'cancelled'));

create index if not exists donor_responses_donor_idx on public.donor_responses(donor_id, created_at desc);
create index if not exists donor_responses_hospital_idx on public.donor_responses(hospital_id, created_at desc);
create index if not exists donor_responses_request_idx on public.donor_responses(blood_request_id);

alter table public.donor_responses enable row level security;

drop policy if exists "Donors read own responses" on public.donor_responses;
create policy "Donors read own responses" on public.donor_responses
for select using (donor_id = public.current_donor_id());

drop policy if exists "Donors create own responses" on public.donor_responses;
create policy "Donors create own responses" on public.donor_responses
for insert with check (donor_id = public.current_donor_id());

drop policy if exists "Hospitals read own responses" on public.donor_responses;
create policy "Hospitals read own responses" on public.donor_responses
for select using (hospital_id = public.current_profile_entity() or public.is_admin());

drop policy if exists "Admins read all responses" on public.donor_responses;
create policy "Admins read all responses" on public.donor_responses
for select using (public.is_admin());

drop policy if exists "Hospitals update own responses" on public.donor_responses;
create policy "Hospitals update own responses" on public.donor_responses
for update using (hospital_id = public.current_profile_entity() or public.is_admin())
with check (hospital_id = public.current_profile_entity() or public.is_admin());
