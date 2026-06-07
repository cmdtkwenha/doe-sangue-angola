alter table public.donors
drop constraint if exists donors_eligibility_status_check;

update public.donors
set eligibility_status = case eligibility_status
  when 'eligible' then 'Elegível'
  when 'Elegível' then 'Elegível'
  when 'Verificado' then 'Elegível'
  when 'pending_verification' then 'Pendente'
  when 'Verificação Pendente' then 'Pendente'
  when 'pending' then 'Pendente'
  when 'needs_review' then 'Revisão Necessária'
  when 'temporarily_deferred' then 'Temporariamente Inelegível'
  when 'Diferido Temporário' then 'Temporariamente Inelegível'
  when 'permanently_deferred' then 'Inelegível'
  when 'Diferido Permanente' then 'Inelegível'
  when 'ineligible' then 'Inelegível'
  when 'Suspenso' then 'Inelegível'
  else coalesce(eligibility_status, 'Pendente')
end;

alter table public.donors
alter column eligibility_status set default 'Pendente';

alter table public.donors
add constraint donors_eligibility_status_check
check (eligibility_status in (
  'Pendente',
  'Elegível',
  'Inelegível',
  'Temporariamente Inelegível',
  'Revisão Necessária'
));
