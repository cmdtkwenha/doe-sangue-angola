-- Quota-based fulfillment for blood requests.

alter table public.blood_requests
  add column if not exists accepted_count integer not null default 0,
  add column if not exists remaining_slots integer not null default 1,
  add column if not exists units_needed integer not null default 1;

update public.blood_requests
set units_needed = greatest(coalesce(units_needed, units, 1), 1),
    accepted_count = greatest(coalesce(accepted_count, 0), 0),
    remaining_slots = greatest(coalesce(units_needed, units, 1) - greatest(coalesce(accepted_count, 0), 0), 0);

create table if not exists public.request_acceptances (
  id uuid primary key default extensions.gen_random_uuid(),
  request_id uuid not null references public.blood_requests(id) on delete cascade,
  donor_id uuid not null references public.donors(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  pin text not null,
  status text not null default 'ACCEPTED',
  accepted_at timestamptz not null default now(),
  arrived_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.request_acceptances
  drop constraint if exists request_acceptances_status_check;
alter table public.request_acceptances
  add constraint request_acceptances_status_check
  check (status in ('ACCEPTED', 'ARRIVED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'));

create unique index if not exists request_acceptances_unique_donor_request
  on public.request_acceptances(request_id, donor_id);
create index if not exists request_acceptances_request_idx on public.request_acceptances(request_id);
create index if not exists request_acceptances_donor_status_idx on public.request_acceptances(donor_id, status);
create index if not exists request_acceptances_hospital_idx on public.request_acceptances(hospital_id);

alter table public.request_acceptances enable row level security;

drop policy if exists "Donors read own request acceptances" on public.request_acceptances;
create policy "Donors read own request acceptances"
  on public.request_acceptances for select
  using (exists (
    select 1 from public.donors d
    where d.id = donor_id and d.user_id = auth.uid()
  ));

drop policy if exists "Admins read request acceptances" on public.request_acceptances;
create policy "Admins read request acceptances"
  on public.request_acceptances for select
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  ));

alter table public.donor_responses
  drop constraint if exists donor_responses_status_check;
alter table public.donor_responses
  add constraint donor_responses_status_check
  check (status in ('accepted', 'arrived', 'pin_validated', 'completed', 'cancelled', 'no_show'));

create unique index if not exists donor_responses_unique_donor_request
  on public.donor_responses(donor_id, blood_request_id);

create or replace function public.recompute_request_quota(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  required integer;
  secured integer;
  completed integer;
  next_status text;
begin
  select greatest(coalesce(units_needed, units, 1), 1)
    into required
  from public.blood_requests
  where id = p_request_id
  for update;

  select count(*) into secured
  from public.donor_responses
  where blood_request_id = p_request_id
    and status in ('accepted', 'arrived', 'pin_validated', 'completed');

  select count(*) into completed
  from public.donor_responses
  where blood_request_id = p_request_id
    and status = 'completed';

  next_status := case
    when completed >= required then 'COMPLETED'
    when secured >= required then 'FULFILLED'
    else 'OPEN'
  end;

  update public.blood_requests
  set units_needed = required,
      accepted_count = secured,
      remaining_slots = greatest(required - secured, 0),
      status = next_status
  where id = p_request_id;
end;
$$;

create or replace function public.accept_blood_request_quota(p_request_id uuid, p_donor_id uuid)
returns table(response_id uuid, confirmation_pin text, hospital_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  req record;
  active_response record;
  pin text;
  response uuid;
begin
  select * into req
  from public.blood_requests
  where id = p_request_id
  for update;

  if req.id is null then
    raise exception 'Pedido de sangue não encontrado.';
  end if;

  perform public.recompute_request_quota(p_request_id);

  select * into req
  from public.blood_requests
  where id = p_request_id
  for update;

  if req.status not in ('OPEN', 'Aberto', 'Em Correspondência') or coalesce(req.remaining_slots, 0) <= 0 then
    raise exception 'Pedido preenchido.';
  end if;

  select id, confirmation_pin, hospital_id into active_response
  from public.donor_responses
  where donor_id = p_donor_id
    and status in ('accepted', 'arrived')
  order by created_at desc
  limit 1;

  if active_response.id is not null then
    if active_response.id is not null and active_response.hospital_id = req.hospital_id then
      raise exception 'Já possui um pedido ativo.';
    end if;
    raise exception 'Já possui um pedido ativo.';
  end if;

  pin := lpad(floor(random() * 9000 + 1000)::text, 4, '0');

  insert into public.request_acceptances (request_id, donor_id, hospital_id, pin, status, accepted_at)
  values (p_request_id, p_donor_id, req.hospital_id, pin, 'ACCEPTED', now())
  on conflict (request_id, donor_id) do update
    set pin = excluded.pin,
        status = 'ACCEPTED',
        accepted_at = now(),
        cancelled_at = null,
        updated_at = now();

  insert into public.donor_responses (
    blood_request_id, confirmation_pin, donor_id, eta_minutes, hospital_id,
    accepted_at, pin_expires_at, status
  )
  values (p_request_id, pin, p_donor_id, 15, req.hospital_id, now(), now() + interval '6 hours', 'accepted')
  on conflict (donor_id, blood_request_id) do update
    set confirmation_pin = excluded.confirmation_pin,
        accepted_at = now(),
        cancelled_at = null,
        eta_minutes = 15,
        hospital_id = excluded.hospital_id,
        pin_expires_at = excluded.pin_expires_at,
        status = 'accepted'
  returning id into response;

  perform public.recompute_request_quota(p_request_id);

  return query select response, pin, req.hospital_id;
end;
$$;

create or replace function public.mark_request_no_shows(p_window interval default interval '2 hours')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
  request_id uuid;
  request_ids uuid[];
begin
  select array_agg(distinct blood_request_id) into request_ids
  from public.donor_responses
  where status = 'accepted'
    and accepted_at < now() - p_window;

  update public.donor_responses
  set status = 'no_show',
      cancelled_at = now()
  where status = 'accepted'
    and accepted_at < now() - p_window;
  get diagnostics affected = row_count;

  update public.request_acceptances
  set status = 'NO_SHOW',
      cancelled_at = now(),
      updated_at = now()
  where status = 'ACCEPTED'
    and accepted_at < now() - p_window;

  if request_ids is not null then
    foreach request_id in array request_ids loop
      perform public.recompute_request_quota(request_id);
    end loop;
  end if;

  return affected;
end;
$$;
