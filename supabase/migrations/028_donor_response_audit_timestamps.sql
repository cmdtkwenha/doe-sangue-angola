-- Add explicit audit timestamps for the donor response workflow.

alter table public.donor_responses
  add column if not exists accepted_at timestamptz,
  add column if not exists pin_validated_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists cancelled_at timestamptz;

update public.donor_responses
set accepted_at = coalesce(accepted_at, created_at)
where status in ('accepted', 'arrived', 'pin_validated', 'completed')
  and accepted_at is null;

update public.donor_responses
set pin_validated_at = coalesce(pin_validated_at, updated_at, now())
where status in ('pin_validated', 'completed')
  and pin_validated_at is null;

update public.donor_responses
set completed_at = coalesce(completed_at, donation_completed_at, updated_at, now())
where status = 'completed'
  and completed_at is null;

update public.donor_responses
set cancelled_at = coalesce(cancelled_at, updated_at, now())
where status = 'cancelled'
  and cancelled_at is null;
