update public.donors
set eligibility_status = case eligibility_status
  when 'eligible' then 'Verificado'
  when 'pending_verification' then 'Pendente'
  when 'needs_review' then 'Revisão Necessária'
  when 'temporarily_deferred' then 'Suspenso'
  when 'permanently_deferred' then 'Suspenso'
  when 'Elegível' then 'Verificado'
  else coalesce(eligibility_status, 'Pendente')
end;

alter table public.donors
drop constraint if exists donors_eligibility_status_check;

alter table public.donors
add constraint donors_eligibility_status_check
check (eligibility_status in (
  'Pendente',
  'Verificado',
  'Suspenso',
  'Revisão Necessária',
  'Verificação Pendente'
));
