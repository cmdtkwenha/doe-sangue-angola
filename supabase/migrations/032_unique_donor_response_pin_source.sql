-- Make donor_responses the single source of truth for donor request PINs.
-- Older duplicates are preserved as archived history instead of being deleted.

alter table public.donor_responses
  add column if not exists archived_at timestamptz;

with ranked as (
  select
    id,
    row_number() over (
      partition by donor_id, blood_request_id
      order by created_at desc, id desc
    ) as position
  from public.donor_responses
  where archived_at is null
)
update public.donor_responses response
set
  archived_at = now(),
  status = case
    when response.status = 'completed' then response.status
    else 'cancelled'
  end,
  cancelled_at = case
    when response.status = 'completed' then response.cancelled_at
    else coalesce(response.cancelled_at, now())
  end
from ranked
where response.id = ranked.id
  and ranked.position > 1
  and response.archived_at is null;

drop index if exists donor_responses_unique_donor_request;

create unique index if not exists donor_responses_unique_donor_request
  on public.donor_responses(donor_id, blood_request_id)
  where archived_at is null;
