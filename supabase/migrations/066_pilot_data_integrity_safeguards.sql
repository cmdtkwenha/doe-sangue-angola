-- Pilot data integrity safeguards.
-- Safe for existing pilot databases: no tables are dropped and no production data is deleted.

update public.blood_requests
set units_needed = greatest(coalesce(units_needed, units, 1), 1),
    accepted_count = greatest(coalesce(accepted_count, 0), 0),
    remaining_slots = greatest(coalesce(remaining_slots, greatest(coalesce(units_needed, units, 1), 1) - coalesce(accepted_count, 0)), 0),
    status = coalesce(status, 'Aberto')
where units_needed is null
   or units_needed < 1
   or accepted_count is null
   or remaining_slots is null
   or status is null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'blood_requests_required_fields_check') then
    alter table public.blood_requests
      add constraint blood_requests_required_fields_check
      check (hospital_id is not null and blood_type is not null and units_needed is not null and status is not null)
      not valid;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'blood_requests_quota_non_negative_check') then
    alter table public.blood_requests
      add constraint blood_requests_quota_non_negative_check
      check (units_needed > 0 and accepted_count >= 0 and remaining_slots >= 0)
      not valid;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'blood_requests_hospital_fk') then
    alter table public.blood_requests
      add constraint blood_requests_hospital_fk
      foreign key (hospital_id) references public.hospitals(id) on delete restrict
      not valid;
  end if;
end $$;

alter table public.donor_responses add column if not exists archived_at timestamptz;

with ranked as (
  select id, row_number() over (partition by donor_id order by created_at desc, id desc) as position
  from public.donor_responses
  where status in ('Dador a Caminho', 'Chegou', 'PIN Validado')
    and archived_at is null
)
update public.donor_responses response
set status = 'Cancelado',
    cancelled_at = coalesce(response.cancelled_at, now()),
    archived_at = coalesce(response.archived_at, now())
from ranked
where response.id = ranked.id
  and ranked.position > 1;

with ranked as (
  select id, row_number() over (partition by donor_id order by accepted_at desc nulls last, created_at desc, id desc) as position
  from public.request_acceptances
  where status in ('Aceite', 'Chegou')
)
update public.request_acceptances acceptance
set status = 'Cancelado',
    cancelled_at = coalesce(acceptance.cancelled_at, now()),
    updated_at = now()
from ranked
where acceptance.id = ranked.id
  and ranked.position > 1;

create unique index if not exists donor_responses_one_active_per_donor
  on public.donor_responses(donor_id)
  where status in ('Dador a Caminho', 'Chegou', 'PIN Validado') and archived_at is null;

create unique index if not exists request_acceptances_one_active_per_donor
  on public.request_acceptances(donor_id)
  where status in ('Aceite', 'Chegou');

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'donor_responses_pin_format_check') then
    alter table public.donor_responses
      add constraint donor_responses_pin_format_check
      check (confirmation_pin ~ '^[0-9]{4}$')
      not valid;
  end if;
end $$;

do $$
begin
  if to_regclass('public.hospital_inventory') is not null
     and not exists (select 1 from pg_constraint where conname = 'hospital_inventory_non_negative_check') then
    alter table public.hospital_inventory
      add constraint hospital_inventory_non_negative_check
      check (units_available >= 0)
      not valid;
  end if;
end $$;

create or replace function public.accept_blood_request_quota(p_request_id uuid, p_donor_id uuid)
returns table(response_id uuid, confirmation_pin text, hospital_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  req record;
  same_response_id uuid;
  same_response_pin text;
  same_response_hospital_id uuid;
  other_response_id uuid;
  existing_response uuid;
  pin text;
  response uuid;
begin
  select * into req from public.blood_requests where id = p_request_id for update;
  if req.id is null then
    raise exception 'Pedido de sangue não encontrado.';
  end if;

  select id, confirmation_pin, hospital_id
    into same_response_id, same_response_pin, same_response_hospital_id
  from public.donor_responses
  where donor_id = p_donor_id
    and blood_request_id = p_request_id
    and status in ('Dador a Caminho', 'Chegou', 'PIN Validado')
    and archived_at is null
  order by created_at desc
  limit 1;

  if same_response_id is not null then
    return query select same_response_id, same_response_pin, same_response_hospital_id;
    return;
  end if;

  perform public.recompute_request_quota(p_request_id);
  select * into req from public.blood_requests where id = p_request_id for update;

  if req.status in ('Cancelado', 'Concluído') or coalesce(req.remaining_slots, 0) <= 0 then
    raise exception 'Pedido preenchido.';
  end if;

  select id into other_response_id
  from public.donor_responses
  where donor_id = p_donor_id
    and status in ('Dador a Caminho', 'Chegou', 'PIN Validado')
    and archived_at is null
  limit 1;

  if other_response_id is not null then
    raise exception 'Já possui um pedido ativo.';
  end if;

  pin := lpad(floor(random() * 9000 + 1000)::text, 4, '0');

  insert into public.request_acceptances (request_id, donor_id, hospital_id, pin, status, accepted_at)
  values (p_request_id, p_donor_id, req.hospital_id, pin, 'Aceite', now())
  on conflict (request_id, donor_id) do update
    set pin = excluded.pin,
        status = 'Aceite',
        accepted_at = now(),
        cancelled_at = null,
        updated_at = now();

  select id into existing_response
  from public.donor_responses
  where donor_id = p_donor_id
    and blood_request_id = p_request_id
  order by created_at desc
  limit 1;

  if existing_response is not null then
    update public.donor_responses
    set confirmation_pin = pin,
        accepted_at = now(),
        archived_at = null,
        cancelled_at = null,
        eta_minutes = 15,
        hospital_id = req.hospital_id,
        pin_expires_at = now() + interval '6 hours',
        status = 'Dador a Caminho'
    where id = existing_response
    returning id into response;
  else
    insert into public.donor_responses (
      blood_request_id, confirmation_pin, donor_id, eta_minutes, hospital_id,
      accepted_at, pin_expires_at, status
    )
    values (p_request_id, pin, p_donor_id, 15, req.hospital_id, now(), now() + interval '6 hours', 'Dador a Caminho')
    returning id into response;
  end if;

  perform public.recompute_request_quota(p_request_id);
  return query select response, pin, req.hospital_id;
end;
$$;
