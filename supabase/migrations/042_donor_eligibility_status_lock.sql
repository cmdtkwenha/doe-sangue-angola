-- Locks donor eligibility screening status into the production schema.

alter table public.donors
add column if not exists eligibility_status text not null default 'eligible';

update public.donors
set eligibility_status = case
  when eligibility_status in ('eligible', 'temporarily_deferred', 'permanently_deferred', 'needs_review')
    then eligibility_status
  when eligibility_status in ('Elegível', 'Apto', 'Verificado') then 'eligible'
  when eligibility_status in ('Pendente', 'Revisão', 'Em revisão') then 'needs_review'
  else 'eligible'
end;

alter table public.donors
drop constraint if exists donors_eligibility_status_check,
add constraint donors_eligibility_status_check
check (eligibility_status in ('eligible', 'temporarily_deferred', 'permanently_deferred', 'needs_review'));

create index if not exists donors_eligibility_status_idx
on public.donors(eligibility_status);
