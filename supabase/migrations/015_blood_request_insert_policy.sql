create extension if not exists pgcrypto with schema extensions;

alter table public.blood_requests
  add column if not exists hospital_id uuid references public.hospitals(id) on delete cascade,
  add column if not exists blood_type text,
  add column if not exists units_needed integer default 1,
  add column if not exists urgency text,
  add column if not exists province text,
  add column if not exists municipality text,
  add column if not exists notes text,
  add column if not exists status text not null default 'Aberto',
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

create index if not exists blood_requests_hospital_status_idx
  on public.blood_requests(hospital_id, status);
create index if not exists blood_requests_created_by_idx
  on public.blood_requests(created_by);

alter table public.blood_requests enable row level security;

drop policy if exists "Requests hospital insert linked profile" on public.blood_requests;
create policy "Requests hospital insert linked profile" on public.blood_requests
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role = 'hospital'
      and p.linked_entity_id = hospital_id
  )
);

drop policy if exists "Requests hospital read linked profile" on public.blood_requests;
create policy "Requests hospital read linked profile" on public.blood_requests
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role = 'hospital'
      and p.linked_entity_id = hospital_id
  )
);
