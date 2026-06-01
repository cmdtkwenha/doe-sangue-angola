-- Compatibility migration for quota-based request fulfillment.
-- Safe for existing production databases and older blood_requests schemas.

alter table public.blood_requests
  add column if not exists units_needed integer,
  add column if not exists accepted_count integer,
  add column if not exists remaining_slots integer;

do $$
declare
  has_units_required boolean;
  has_bags_requested boolean;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'blood_requests'
      and column_name = 'units_required'
  ) into has_units_required;

  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'blood_requests'
      and column_name = 'bags_requested'
  ) into has_bags_requested;

  if has_units_required and has_bags_requested then
    update public.blood_requests
    set units_needed = coalesce(units_needed, units, units_required, bags_requested, 1);
  elsif has_units_required then
    update public.blood_requests
    set units_needed = coalesce(units_needed, units, units_required, 1);
  elsif has_bags_requested then
    update public.blood_requests
    set units_needed = coalesce(units_needed, units, bags_requested, 1);
  else
    update public.blood_requests
    set units_needed = coalesce(units_needed, units, 1);
  end if;
end $$;

update public.blood_requests br
set accepted_count = coalesce(active.count, 0)
from (
  select blood_request_id, count(*)::integer as count
  from public.donor_responses
  where status in ('accepted', 'arrived', 'pin_validated', 'completed')
  group by blood_request_id
) active
where br.id = active.blood_request_id;

update public.blood_requests
set accepted_count = coalesce(accepted_count, 0),
    remaining_slots = greatest(coalesce(units_needed, 1) - coalesce(accepted_count, 0), 0);

alter table public.blood_requests
  alter column units_needed set default 1,
  alter column accepted_count set default 0,
  alter column remaining_slots set default 1;

update public.blood_requests
set units_needed = greatest(coalesce(units_needed, 1), 1),
    accepted_count = greatest(coalesce(accepted_count, 0), 0),
    remaining_slots = greatest(coalesce(remaining_slots, 0), 0);

alter table public.blood_requests
  alter column units_needed set not null,
  alter column accepted_count set not null,
  alter column remaining_slots set not null;

alter table public.blood_requests
  drop constraint if exists blood_requests_units_needed_positive,
  add constraint blood_requests_units_needed_positive check (units_needed >= 1);

alter table public.blood_requests
  drop constraint if exists blood_requests_counts_non_negative,
  add constraint blood_requests_counts_non_negative check (
    accepted_count >= 0 and remaining_slots >= 0
  );
