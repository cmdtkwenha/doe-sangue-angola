-- Allow hospitals to resolve names for donors who accepted their requests.
-- No columns are added; this only narrows read access to relevant user rows.

drop policy if exists "Hospitals read accepted donor users" on public.users;

create policy "Hospitals read accepted donor users" on public.users
for select using (
  public.current_profile_role() = 'hospital'
  and exists (
    select 1
    from public.donors d
    join public.donor_responses dr on dr.donor_id = d.id
    where d.user_id = users.id
      and dr.hospital_id = public.current_profile_entity()
  )
);
