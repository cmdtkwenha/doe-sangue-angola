-- Endurecimento final de segurança e fraude para piloto/produção.
-- Seguro para bases existentes: apenas adiciona colunas, políticas auxiliares e funções.

alter table public.donor_responses
  add column if not exists pin_expires_at timestamptz,
  add column if not exists pin_locked_until timestamptz,
  add column if not exists last_pin_attempt_at timestamptz,
  add column if not exists failed_pin_attempts integer not null default 0;

alter table public.fraud_reviews
  add column if not exists entity_type text,
  add column if not exists entity_id uuid,
  add column if not exists score integer not null default 0,
  add column if not exists flags text[] not null default '{}',
  add column if not exists updated_at timestamptz not null default now();

create index if not exists donor_responses_pin_security_idx
  on public.donor_responses(status, pin_expires_at, failed_pin_attempts);

create index if not exists fraud_reviews_entity_idx
  on public.fraud_reviews(entity_type, entity_id, status);

create or replace function public.pin_validity_window()
returns interval
language sql
stable
as $$
  select coalesce(nullif(current_setting('app.pin_valid_hours', true), '')::integer, 6) * interval '1 hour';
$$;

create or replace function public.flag_excessive_hospital_requests()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.blood_requests br
  where br.hospital_id = new.hospital_id
    and br.created_at >= now() - interval '10 minutes';

  if recent_count >= 12 then
    insert into public.fraud_reviews (
      blood_request_id, entity_type, entity_id, risk, status, score, flags, updated_at
    )
    values (
      new.id,
      'hospital',
      new.hospital_id,
      'Alto',
      'Revisão Necessária',
      88,
      array['Criação excessiva de pedidos', recent_count::text || ' pedidos em 10 minutos'],
      now()
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists flag_excessive_hospital_requests_trigger on public.blood_requests;
create trigger flag_excessive_hospital_requests_trigger
after insert on public.blood_requests
for each row execute function public.flag_excessive_hospital_requests();

create or replace function public.prevent_pin_reuse_after_final_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status in ('Doação concluída', 'Concluído', 'Cancelado', 'Não Compareceu') then
    if new.confirmation_pin <> old.confirmation_pin then
      raise exception 'PIN finalizado não pode ser reutilizado ou alterado.';
    end if;
    if new.status <> old.status then
      raise exception 'Resposta finalizada não pode voltar ao fluxo ativo.';
    end if;
  end if;

  if old.donor_id <> new.donor_id
     or old.blood_request_id <> new.blood_request_id
     or old.hospital_id <> new.hospital_id then
    raise exception 'Aceitação não pode mudar de dador, pedido ou hospital.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_pin_reuse_after_final_status_trigger on public.donor_responses;
create trigger prevent_pin_reuse_after_final_status_trigger
before update on public.donor_responses
for each row execute function public.prevent_pin_reuse_after_final_status();

create or replace function public.accept_blood_request_quota(p_request_id uuid, p_donor_id uuid)
returns table(response_id uuid, confirmation_pin text, hospital_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.blood_requests%rowtype;
  same_response public.donor_responses%rowtype;
  active_response_id uuid;
  donor_auth_user_id uuid;
  v_pin text;
begin
  select br.* into req
  from public.blood_requests br
  where br.id = p_request_id
  for update;

  if req.id is null then raise exception 'Pedido de sangue não encontrado.'; end if;

  select u.auth_user_id into donor_auth_user_id
  from public.donors d
  join public.users u on u.id = d.user_id
  where d.id = p_donor_id;

  if donor_auth_user_id is not null and donor_auth_user_id = req.created_by then
    raise exception 'Não pode aceitar um pedido criado pela sua própria conta.';
  end if;

  select dr.* into same_response
  from public.donor_responses dr
  where dr.donor_id = p_donor_id
    and dr.blood_request_id = p_request_id
    and dr.status in ('Dador a Caminho', 'Chegou', 'PIN Validado')
    and dr.archived_at is null
  order by dr.created_at desc
  limit 1;

  if same_response.id is not null then
    response_id := same_response.id;
    confirmation_pin := same_response.confirmation_pin;
    hospital_id := same_response.hospital_id;
    return next;
    return;
  end if;

  perform public.recompute_request_quota(p_request_id);

  select br.* into req
  from public.blood_requests br
  where br.id = p_request_id
  for update;

  if req.status not in ('Aberto', 'Em Correspondência', 'Dador a Caminho')
     or coalesce(req.remaining_slots, 0) <= 0 then
    raise exception 'Pedido preenchido.';
  end if;

  select dr.id into active_response_id
  from public.donor_responses dr
  where dr.donor_id = p_donor_id
    and dr.status in ('Dador a Caminho', 'Chegou', 'PIN Validado')
    and dr.archived_at is null
  limit 1;

  if active_response_id is not null then raise exception 'Já possui um pedido ativo.'; end if;

  v_pin := lpad(floor(random() * 9000 + 1000)::text, 4, '0');

  insert into public.request_acceptances (request_id, donor_id, hospital_id, pin, status, accepted_at)
  values (p_request_id, p_donor_id, req.hospital_id, v_pin, 'Dador a Caminho', now())
  on conflict (request_id, donor_id) do update
    set status = 'Dador a Caminho',
        accepted_at = now(),
        cancelled_at = null,
        updated_at = now();

  insert into public.donor_responses (
    blood_request_id, confirmation_pin, donor_id, eta_minutes, hospital_id,
    accepted_at, pin_expires_at, status, archived_at, cancelled_at
  )
  values (
    p_request_id, v_pin, p_donor_id, 15, req.hospital_id,
    now(), now() + public.pin_validity_window(), 'Dador a Caminho', null, null
  )
  on conflict (donor_id, blood_request_id) do update
    set accepted_at = now(),
        archived_at = null,
        cancelled_at = null,
        eta_minutes = 15,
        hospital_id = excluded.hospital_id,
        pin_expires_at = excluded.pin_expires_at,
        status = 'Dador a Caminho'
  returning id, confirmation_pin, donor_responses.hospital_id
  into response_id, confirmation_pin, hospital_id;

  perform public.recompute_request_quota(p_request_id);
  return next;
end;
$$;
