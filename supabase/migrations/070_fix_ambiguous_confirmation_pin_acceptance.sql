-- Corrige a aceitação do dador quando confirmation_pin fica ambíguo dentro da RPC.
-- Mantém dados existentes e substitui apenas a função ativa por uma versão com aliases explícitos.

update public.request_acceptances
set status = 'Dador a Caminho'
where status = 'Aceite';

alter table public.request_acceptances
  drop constraint if exists request_acceptances_status_check;

alter table public.request_acceptances
  add constraint request_acceptances_status_check
  check (status in (
    'Dador a Caminho',
    'Aceite',
    'Chegou',
    'PIN Validado',
    'Concluído',
    'Doação concluída',
    'Cancelado',
    'Não Compareceu'
  ));

drop index if exists request_acceptances_one_active_per_donor;
create unique index request_acceptances_one_active_per_donor
  on public.request_acceptances(donor_id)
  where status in ('Dador a Caminho', 'Aceite', 'Chegou', 'PIN Validado');

create or replace function public.accept_blood_request_quota(p_request_id uuid, p_donor_id uuid)
returns table(response_id uuid, confirmation_pin text, hospital_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.blood_requests%rowtype;
  same_response_id uuid;
  same_response_pin text;
  same_response_hospital_id uuid;
  active_response_id uuid;
  v_pin text;
  v_response_id uuid;
  v_response_pin text;
  v_response_hospital_id uuid;
begin
  select br.*
    into req
  from public.blood_requests br
  where br.id = p_request_id
  for update;

  if req.id is null then
    raise exception 'Pedido de sangue não encontrado.';
  end if;

  select dr.id, dr.confirmation_pin, dr.hospital_id
    into same_response_id, same_response_pin, same_response_hospital_id
  from public.donor_responses dr
  where dr.donor_id = p_donor_id
    and dr.blood_request_id = p_request_id
    and dr.status in ('Dador a Caminho', 'Chegou', 'PIN Validado')
    and dr.archived_at is null
  order by dr.created_at desc
  limit 1;

  if same_response_id is not null then
    response_id := same_response_id;
    confirmation_pin := same_response_pin;
    hospital_id := same_response_hospital_id;
    return next;
    return;
  end if;

  perform public.recompute_request_quota(p_request_id);

  select br.*
    into req
  from public.blood_requests br
  where br.id = p_request_id
  for update;

  if req.status not in ('Aberto', 'Em Correspondência', 'Dador a Caminho')
     or coalesce(req.remaining_slots, 0) <= 0 then
    raise exception 'Pedido preenchido.';
  end if;

  select dr.id
    into active_response_id
  from public.donor_responses dr
  where dr.donor_id = p_donor_id
    and dr.status in ('Dador a Caminho', 'Chegou', 'PIN Validado')
    and dr.archived_at is null
  order by dr.created_at desc
  limit 1;

  if active_response_id is not null then
    raise exception 'Já possui um pedido ativo.';
  end if;

  if exists (
    select 1
    from public.request_acceptances ra
    where ra.donor_id = p_donor_id
      and ra.status in ('Dador a Caminho', 'Aceite', 'Chegou', 'PIN Validado')
  ) then
    raise exception 'Já possui um pedido ativo.';
  end if;

  v_pin := lpad(floor(random() * 9000 + 1000)::text, 4, '0');

  insert into public.request_acceptances (request_id, donor_id, hospital_id, pin, status, accepted_at)
  values (p_request_id, p_donor_id, req.hospital_id, v_pin, 'Dador a Caminho', now())
  on conflict (request_id, donor_id) do update
    set pin = excluded.pin,
        status = 'Dador a Caminho',
        accepted_at = now(),
        cancelled_at = null,
        updated_at = now();

  with upserted as (
    insert into public.donor_responses (
      blood_request_id,
      confirmation_pin,
      donor_id,
      eta_minutes,
      hospital_id,
      accepted_at,
      pin_expires_at,
      status,
      archived_at,
      cancelled_at
    )
    values (
      p_request_id,
      v_pin,
      p_donor_id,
      15,
      req.hospital_id,
      now(),
      now() + interval '6 hours',
      'Dador a Caminho',
      null,
      null
    )
    on conflict (donor_id, blood_request_id) do update
      set confirmation_pin = excluded.confirmation_pin,
          accepted_at = now(),
          archived_at = null,
          cancelled_at = null,
          eta_minutes = 15,
          hospital_id = excluded.hospital_id,
          pin_expires_at = excluded.pin_expires_at,
          status = 'Dador a Caminho'
    returning
      public.donor_responses.id as response_id_value,
      public.donor_responses.confirmation_pin as pin_value,
      public.donor_responses.hospital_id as hospital_id_value
  )
  select upserted.response_id_value, upserted.pin_value, upserted.hospital_id_value
    into v_response_id, v_response_pin, v_response_hospital_id
  from upserted;

  perform public.recompute_request_quota(p_request_id);

  response_id := v_response_id;
  confirmation_pin := v_response_pin;
  hospital_id := v_response_hospital_id;
  return next;
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
  select array_agg(distinct dr.blood_request_id)
    into request_ids
  from public.donor_responses dr
  where dr.status = 'Dador a Caminho'
    and dr.accepted_at < now() - p_window;

  update public.donor_responses dr
  set status = 'Não Compareceu',
      cancelled_at = now()
  where dr.status = 'Dador a Caminho'
    and dr.accepted_at < now() - p_window;
  get diagnostics affected = row_count;

  update public.request_acceptances ra
  set status = 'Não Compareceu',
      cancelled_at = now(),
      updated_at = now()
  where ra.status in ('Dador a Caminho', 'Aceite')
    and ra.accepted_at < now() - p_window;

  if request_ids is not null then
    foreach request_id in array request_ids loop
      perform public.recompute_request_quota(request_id);
    end loop;
  end if;

  return affected;
end;
$$;
