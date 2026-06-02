-- Keep automatic no-show handling aligned with Portuguese workflow statuses.

create or replace function public.mark_request_no_shows(p_window interval default interval '2 hours')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
  request_id uuid;
  request_ids uuid[];
begin
  select array_agg(distinct blood_request_id) into request_ids
  from public.donor_responses
  where status = 'Dador a Caminho'
    and accepted_at < now() - p_window;

  update public.donor_responses
  set status = 'Não Compareceu',
      cancelled_at = now()
  where status = 'Dador a Caminho'
    and accepted_at < now() - p_window;
  get diagnostics affected = row_count;

  update public.request_acceptances
  set status = 'Não Compareceu',
      cancelled_at = now(),
      updated_at = now()
  where status = 'Aceite'
    and accepted_at < now() - p_window;

  if request_ids is not null then
    foreach request_id in array request_ids loop
      perform public.recompute_request_quota(request_id);
    end loop;
  end if;

  return affected;
end;
$$;
