alter table public.hospitals
drop constraint if exists hospitals_verification_status_check;

alter table public.hospitals
add constraint hospitals_verification_status_check
check (verification_status in (
  'pending',
  'needs_review',
  'verified',
  'rejected',
  'suspended'
));
