-- Fix donor acceptance failures caused by blood_requests status constraint drift.
-- Portuguese-only request statuses: Aberto, Dador a Caminho, PIN Validado, Concluído, Cancelado.

update public.blood_requests
set status = case
  when status in ('OPEN', 'Em Correspondência', 'Agendado', 'Triagem') then 'Aberto'
  when status in ('FULFILLED', 'Preenchido', 'Pedido preenchido', 'Doador a Caminho') then 'Dador a Caminho'
  when status in ('COMPLETED', 'Concluido') then 'Concluído'
  when status = 'CANCELLED' then 'Cancelado'
  else status
end;

alter table public.blood_requests
  drop constraint if exists blood_requests_status_check,
  add constraint blood_requests_status_check
  check (status in ('Aberto', 'Dador a Caminho', 'PIN Validado', 'Concluído', 'Cancelado'));

drop policy if exists "Donors accept compatible requests" on public.blood_requests;
create policy "Donors accept compatible requests" on public.blood_requests
for update using (
  public.current_profile_role() = 'donor'
  and status in ('Aberto', 'Dador a Caminho')
  and (province is null or province = public.current_donor_province())
)
with check (
  public.current_profile_role() = 'donor'
  and status = 'Dador a Caminho'
);

drop policy if exists "Requests donor read open" on public.blood_requests;
create policy "Requests donor read open" on public.blood_requests
for select using (
  public.current_profile_role() = 'donor'
  and status in ('Aberto', 'Dador a Caminho')
  and coalesce(remaining_slots, units_needed, units, 1) > 0
);

drop policy if exists "Requests donor accepted status update" on public.blood_requests;
create policy "Requests donor accepted status update" on public.blood_requests
for update using (
  public.current_profile_role() = 'donor'
  and exists (
    select 1 from public.donor_responses dr
    where dr.blood_request_id = blood_requests.id
      and dr.donor_id = public.current_profile_entity()
  )
)
with check (status in ('Dador a Caminho', 'PIN Validado', 'Concluído', 'Cancelado'));

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
    and status in ('Dador a Caminho', 'Chegou', 'PIN Validado', 'Doação concluída');

  select count(*) into completed
  from public.donor_responses
  where blood_request_id = p_request_id
    and status = 'Doação concluída';

  next_status := case
    when completed >= required then 'Concluído'
    when secured > 0 then 'Dador a Caminho'
    else 'Aberto'
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
  select * into req from public.blood_requests where id = p_request_id for update;
  if req.id is null then
    raise exception 'Pedido de sangue não encontrado.';
  end if;

  perform public.recompute_request_quota(p_request_id);
  select * into req from public.blood_requests where id = p_request_id for update;

  if req.status not in ('Aberto', 'Dador a Caminho') or coalesce(req.remaining_slots, 0) <= 0 then
    raise exception 'Pedido preenchido.';
  end if;

  select id into active_response
  from public.donor_responses
  where donor_id = p_donor_id
    and status in ('Dador a Caminho', 'Chegou', 'PIN Validado')
  order by created_at desc
  limit 1;

  if active_response.id is not null then
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

  insert into public.donor_responses (
    blood_request_id, confirmation_pin, donor_id, eta_minutes, hospital_id,
    accepted_at, pin_expires_at, status
  )
  values (p_request_id, pin, p_donor_id, 15, req.hospital_id, now(), now() + interval '6 hours', 'Dador a Caminho')
  on conflict (donor_id, blood_request_id) do update
    set confirmation_pin = excluded.confirmation_pin,
        accepted_at = now(),
        cancelled_at = null,
        eta_minutes = 15,
        hospital_id = excluded.hospital_id,
        pin_expires_at = excluded.pin_expires_at,
        status = 'Dador a Caminho'
  returning id into response;

  raise notice 'blood_requests.status enviado na aceitação: Dador a Caminho';
  perform public.recompute_request_quota(p_request_id);
  return query select response, pin, req.hospital_id;
end;
$$;
