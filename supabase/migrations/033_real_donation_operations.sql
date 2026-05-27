-- Production operations: cooldown, rewards, emergency broadcast, inventory.

alter table public.donors
  add column if not exists reliability_score integer not null default 7,
  add column if not exists response_speed_minutes integer not null default 60,
  add column if not exists next_eligible_donation_date date;

alter table public.donor_responses
  add column if not exists pin_expires_at timestamptz,
  add column if not exists reward_accepted_at timestamptz,
  add column if not exists reward_arrived_at timestamptz,
  add column if not exists reward_completed_at timestamptz;

alter table public.blood_requests
  drop constraint if exists blood_requests_urgency_check;

alter table public.blood_requests
  add constraint blood_requests_urgency_check
  check (urgency in ('Desastre', 'Critica', 'Alta', 'Media', 'Normal'));

create table if not exists public.hospital_inventory (
  id uuid primary key default extensions.gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  blood_type text not null,
  units_available integer not null default 0,
  daily_usage_estimate numeric not null default 1,
  safe_minimum integer not null default 5,
  updated_at timestamptz not null default now(),
  unique (hospital_id, blood_type)
);

alter table public.hospital_inventory enable row level security;

drop policy if exists "Hospital inventory own read" on public.hospital_inventory;
create policy "Hospital inventory own read" on public.hospital_inventory
for select using (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and (u.role = 'admin' or u.linked_entity_id = hospital_id)
  )
);

drop policy if exists "Hospital inventory own write" on public.hospital_inventory;
create policy "Hospital inventory own write" on public.hospital_inventory
for all using (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and (u.role = 'admin' or u.linked_entity_id = hospital_id)
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and (u.role = 'admin' or u.linked_entity_id = hospital_id)
  )
);

alter table public.hospital_inventory replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'hospital_inventory'
  ) then
    alter publication supabase_realtime add table public.hospital_inventory;
  end if;
end $$;

drop policy if exists "Hospitals update completed donor operations" on public.donors;
create policy "Hospitals update completed donor operations" on public.donors
for update using (
  exists (
    select 1
    from public.users u
    join public.donor_responses dr on dr.hospital_id = u.linked_entity_id
    where u.auth_user_id = auth.uid()
      and u.role = 'hospital'
      and dr.donor_id = donors.id
  )
)
with check (
  exists (
    select 1
    from public.users u
    join public.donor_responses dr on dr.hospital_id = u.linked_entity_id
    where u.auth_user_id = auth.uid()
      and u.role = 'hospital'
      and dr.donor_id = donors.id
  )
);
