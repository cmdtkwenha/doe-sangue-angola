-- Standardize request and donor workflow statuses to Angolan Portuguese.
-- Keeps existing rows; converts old English values safely.

update public.blood_requests
set status = case status
  when 'OPEN' then 'Aberto'
  when 'FULFILLED' then 'Preenchido'
  when 'COMPLETED' then 'Concluído'
  when 'CANCELLED' then 'Cancelado'
  else status
end;

update public.donor_responses
set status = case status
  when 'accepted' then 'Dador a Caminho'
  when 'arrived' then 'Chegou'
  when 'pin_validated' then 'PIN Validado'
  when 'completed' then 'Doação concluída'
  when 'cancelled' then 'Cancelado'
  when 'no_show' then 'Não Compareceu'
  else status
end;

update public.request_acceptances
set status = case status
  when 'ACCEPTED' then 'Aceite'
  when 'ARRIVED' then 'Chegou'
  when 'COMPLETED' then 'Concluído'
  when 'CANCELLED' then 'Cancelado'
  when 'NO_SHOW' then 'Não Compareceu'
  else status
end;

alter table public.donor_responses
  drop constraint if exists donor_responses_status_check,
  add constraint donor_responses_status_check
  check (status in ('Dador a Caminho', 'Chegou', 'PIN Validado', 'Doação concluída', 'Cancelado', 'Não Compareceu'));

alter table public.request_acceptances
  drop constraint if exists request_acceptances_status_check,
  add constraint request_acceptances_status_check
  check (status in ('Aceite', 'Chegou', 'Concluído', 'Cancelado', 'Não Compareceu'));

create or replace function public.normalize_donor_response_status_value(input_status text)
returns text
language sql
immutable
as $$
  select case coalesce(input_status, 'Dador a Caminho')
    when 'accepted' then 'Dador a Caminho'
    when 'arrived' then 'Chegou'
    when 'pin_validated' then 'PIN Validado'
    when 'completed' then 'Doação concluída'
    when 'cancelled' then 'Cancelado'
    when 'no_show' then 'Não Compareceu'
    when 'Concluído' then 'Doação concluída'
    when 'Concluido' then 'Doação concluída'
    when 'Não compareceu' then 'Não Compareceu'
    else coalesce(input_status, 'Dador a Caminho')
  end
$$;

create or replace function public.enforce_donor_response_transition()
returns trigger
language plpgsql
as $$
declare
  old_status text;
  new_status text;
begin
  new_status := public.normalize_donor_response_status_value(new.status);
  new.status := new_status;

  if tg_op = 'INSERT' then
    if new_status <> 'Dador a Caminho' then
      raise exception 'Estado inicial inválido para resposta de dador: %', new_status;
    end if;
    return new;
  end if;

  old_status := public.normalize_donor_response_status_value(old.status);
  if old_status = new_status then
    return new;
  end if;

  if old_status in ('Doação concluída', 'Cancelado', 'Não Compareceu') then
    raise exception 'Resposta de dador já fechada: %', old_status;
  end if;

  if new_status in ('Cancelado', 'Não Compareceu') then
    return new;
  end if;

  if (old_status = 'Dador a Caminho' and new_status = 'Chegou')
    or (old_status = 'Chegou' and new_status = 'PIN Validado')
    or (old_status = 'PIN Validado' and new_status = 'Doação concluída') then
    return new;
  end if;

  raise exception 'Transição inválida de % para %', old_status, new_status;
end;
$$;

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
    when secured >= required then 'Preenchido'
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

  if req.status not in ('Aberto', 'Em Correspondência') or coalesce(req.remaining_slots, 0) <= 0 then
    raise exception 'Pedido preenchido.';
  end if;

  select id into active_response
  from public.donor_responses
  where donor_id = p_donor_id
    and status in ('Dador a Caminho', 'Chegou')
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

  perform public.recompute_request_quota(p_request_id);
  return query select response, pin, req.hospital_id;
end;
$$;
