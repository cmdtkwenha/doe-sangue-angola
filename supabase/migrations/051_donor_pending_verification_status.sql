alter table public.donors
drop constraint if exists donors_eligibility_status_check;

alter table public.donors
add constraint donors_eligibility_status_check
check (eligibility_status in (
  'eligible',
  'pending_verification',
  'temporarily_deferred',
  'permanently_deferred',
  'needs_review'
));
