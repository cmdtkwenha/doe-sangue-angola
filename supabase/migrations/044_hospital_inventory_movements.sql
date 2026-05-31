create extension if not exists pgcrypto with schema extensions;

create table if not exists public.inventory_movements (
  id uuid primary key default extensions.gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  blood_type text not null,
  movement_type text not null,
  units integer not null,
  note text,
  created_by uuid,
  created_at timestamptz not null default now()
);

alter table public.inventory_movements
  drop constraint if exists inventory_movements_type_check,
  add constraint inventory_movements_type_check
    check (movement_type in ('donation_received', 'stock_added', 'stock_consumed', 'stock_expired'));

alter table public.inventory_movements
  drop constraint if exists inventory_movements_units_check,
  add constraint inventory_movements_units_check check (units > 0);

create index if not exists inventory_movements_hospital_idx
  on public.inventory_movements(hospital_id);
create index if not exists inventory_movements_blood_type_idx
  on public.inventory_movements(blood_type);
create index if not exists inventory_movements_created_at_idx
  on public.inventory_movements(created_at desc);

alter table public.hospital_inventory
  add column if not exists hospital_id uuid,
  add column if not exists blood_type text,
  add column if not exists units_available integer not null default 0,
  add column if not exists daily_usage_estimate numeric not null default 1,
  add column if not exists safe_minimum integer not null default 5,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists hospital_inventory_hospital_blood_unique
  on public.hospital_inventory(hospital_id, blood_type);

alter table public.inventory_movements enable row level security;

drop policy if exists "Inventory movements own read" on public.inventory_movements;
create policy "Inventory movements own read" on public.inventory_movements
for select using (
  exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid()
      and (p.role = 'admin' or p.linked_entity_id = inventory_movements.hospital_id)
  )
);

drop policy if exists "Inventory movements hospital insert" on public.inventory_movements;
create policy "Inventory movements hospital insert" on public.inventory_movements
for insert with check (
  exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid()
      and (p.role = 'admin' or p.linked_entity_id = inventory_movements.hospital_id)
  )
);

alter table public.inventory_movements replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'inventory_movements'
  ) then
    alter publication supabase_realtime add table public.inventory_movements;
  end if;
end $$;
