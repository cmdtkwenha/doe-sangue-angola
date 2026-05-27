-- Normalizes donor response statuses for the real PIN workflow.

alter table public.donor_responses
  drop constraint if exists donor_responses_status_check;

update public.donor_responses
set status = case status
  when 'Chegou' then 'arrived'
  when 'PIN Validado' then 'pin_validated'
  when 'Concluído' then 'completed'
  when 'Cancelado' then 'cancelled'
  else status
end
where status in ('Chegou', 'PIN Validado', 'Concluído', 'Cancelado');

alter table public.donor_responses
  alter column status set default 'accepted';

alter table public.donor_responses
  add constraint donor_responses_status_check
  check (status in ('accepted', 'arrived', 'pin_validated', 'completed', 'cancelled'));
