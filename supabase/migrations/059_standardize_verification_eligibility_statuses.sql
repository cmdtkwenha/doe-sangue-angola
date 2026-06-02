-- Standardize verification and donor eligibility statuses to Angolan Portuguese.

update public.hospitals
set verification_status = case verification_status
  when 'pending' then 'Pendente'
  when 'verified' then 'Verificado'
  when 'approved' then 'Verificado'
  when 'rejected' then 'Rejeitado'
  when 'suspended' then 'Suspenso'
  when 'needs_review' then 'Revisão Necessária'
  else coalesce(verification_status, case when verified then 'Verificado' else 'Pendente' end)
end;

update public.donors
set eligibility_status = case eligibility_status
  when 'eligible' then 'Elegível'
  when 'pending_verification' then 'Verificação Pendente'
  when 'temporarily_deferred' then 'Diferido Temporário'
  when 'permanently_deferred' then 'Diferido Permanente'
  when 'needs_review' then 'Revisão Necessária'
  else coalesce(eligibility_status, 'Elegível')
end;

update public.hospital_verifications
set status = case status
  when 'pending' then 'Pendente'
  when 'approved' then 'Verificado'
  when 'verified' then 'Verificado'
  when 'rejected' then 'Rejeitado'
  when 'suspended' then 'Suspenso'
  when 'needs_review' then 'Revisão Necessária'
  else status
end;

update public.donor_verifications
set status = case status
  when 'pending' then 'Pendente'
  when 'verified' then 'Verificado'
  when 'rejected' then 'Rejeitado'
  when 'suspended' then 'Suspenso'
  when 'needs_review' then 'Revisão Necessária'
  else status
end;

alter table public.hospitals
  drop constraint if exists hospitals_verification_status_check,
  add constraint hospitals_verification_status_check
  check (verification_status in ('Pendente', 'Verificado', 'Rejeitado', 'Suspenso', 'Revisão Necessária'));

alter table public.donors
  drop constraint if exists donors_eligibility_status_check,
  add constraint donors_eligibility_status_check
  check (eligibility_status in ('Elegível', 'Verificação Pendente', 'Diferido Temporário', 'Diferido Permanente', 'Revisão Necessária'));

alter table public.hospital_verifications
  drop constraint if exists hospital_verifications_status_check,
  add constraint hospital_verifications_status_check
  check (status in ('Pendente', 'Verificado', 'Rejeitado', 'Suspenso', 'Revisão Necessária'));

alter table public.donor_verifications
  drop constraint if exists donor_verifications_status_check,
  add constraint donor_verifications_status_check
  check (status in ('Pendente', 'Verificado', 'Rejeitado', 'Suspenso', 'Revisão Necessária'));
