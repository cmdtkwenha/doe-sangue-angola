alter table public.donors
add column if not exists eligibility_status text not null default 'Pendente';

alter table public.donors
drop constraint if exists donors_eligibility_status_check;

update public.donors
set eligibility_status = case eligibility_status
  when 'Elegível' then 'Elegível'
  when 'Verificado' then 'Elegível'
  when 'eligible' then 'Elegível'
  when 'Pendente' then 'Pendente'
  when 'Verificação Pendente' then 'Pendente'
  when 'pending_verification' then 'Pendente'
  when 'pending' then 'Pendente'
  when 'Inelegível' then 'Inelegível'
  when 'Suspenso' then 'Inelegível'
  when 'Diferido Permanente' then 'Inelegível'
  when 'permanently_deferred' then 'Inelegível'
  when 'ineligible' then 'Inelegível'
  when 'Temporariamente Inelegível' then 'Temporariamente Inelegível'
  when 'Diferido Temporário' then 'Temporariamente Inelegível'
  when 'temporarily_deferred' then 'Temporariamente Inelegível'
  when 'Revisão Necessária' then 'Revisão Necessária'
  when 'needs_review' then 'Revisão Necessária'
  else 'Pendente'
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

alter table public.donor_verifications
drop constraint if exists donor_verifications_status_check;

update public.donor_verifications
set status = case status
  when 'Verificado' then 'Elegível'
  when 'eligible' then 'Elegível'
  when 'Suspenso' then 'Inelegível'
  when 'rejected' then 'Inelegível'
  when 'suspended' then 'Inelegível'
  when 'pending' then 'Pendente'
  when 'needs_review' then 'Revisão Necessária'
  else coalesce(status, 'Pendente')
end;

alter table public.donor_verifications
add constraint donor_verifications_status_check
check (status in (
  'Pendente',
  'Elegível',
  'Inelegível',
  'Temporariamente Inelegível',
  'Revisão Necessária'
));
