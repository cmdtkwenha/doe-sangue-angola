-- Enforce donor response workflow order at the database boundary.

create or replace function public.enforce_donor_response_transition()
returns trigger
language plpgsql
as $$
declare
  old_status text;
  new_status text;
begin
  new_status := public.normalize_donor_response_status_value(new.status);

  if tg_op = 'INSERT' then
    if new_status <> 'accepted' then
      raise exception 'Estado inicial inválido para resposta de dador: %', new_status;
    end if;
    return new;
  end if;

  old_status := public.normalize_donor_response_status_value(old.status);
  if old_status = new_status then
    return new;
  end if;

  if old_status in ('completed', 'cancelled') then
    raise exception 'Resposta de dador já fechada: %', old_status;
  end if;

  if new_status = 'cancelled' then
    return new;
  end if;

  if (old_status = 'accepted' and new_status = 'arrived')
    or (old_status = 'arrived' and new_status = 'pin_validated')
    or (old_status = 'pin_validated' and new_status = 'completed') then
    return new;
  end if;

  raise exception 'Transição inválida de % para %', old_status, new_status;
end;
$$;

drop trigger if exists zz_donor_responses_enforce_transition on public.donor_responses;
create trigger zz_donor_responses_enforce_transition
before insert or update of status on public.donor_responses
for each row execute function public.enforce_donor_response_transition();
