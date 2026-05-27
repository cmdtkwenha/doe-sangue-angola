-- Keep donor response statuses canonical while preserving existing data.

create or replace function public.normalize_donor_response_status_value(input_status text)
returns text
language sql
immutable
as $$
  select case coalesce(input_status, 'accepted')
    when 'accepted' then 'accepted'
    when 'arrived' then 'arrived'
    when 'pin_validated' then 'pin_validated'
    when 'completed' then 'completed'
    when 'cancelled' then 'cancelled'
    when 'Chegou' then 'arrived'
    when 'PIN Validado' then 'pin_validated'
    when 'Concluído' then 'completed'
    when 'Concluido' then 'completed'
    when 'Cancelado' then 'cancelled'
    when 'Dador a Caminho' then 'accepted'
    else 'accepted'
  end
$$;

create or replace function public.normalize_donor_response_status()
returns trigger
language plpgsql
as $$
begin
  new.status = public.normalize_donor_response_status_value(new.status);
  return new;
end;
$$;

drop trigger if exists donor_responses_normalize_status on public.donor_responses;
create trigger donor_responses_normalize_status
before insert or update on public.donor_responses
for each row execute function public.normalize_donor_response_status();

alter table public.donor_responses
  drop constraint if exists donor_responses_status_check;

update public.donor_responses
set status = public.normalize_donor_response_status_value(status)
where status is distinct from public.normalize_donor_response_status_value(status);

alter table public.donor_responses
  alter column status set default 'accepted';

alter table public.donor_responses
  add constraint donor_responses_status_check
  check (status in ('accepted', 'arrived', 'pin_validated', 'completed', 'cancelled'));
