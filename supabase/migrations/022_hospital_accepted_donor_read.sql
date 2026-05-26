-- Let hospital users read donor rows only when the donor accepted that hospital.

drop policy if exists "Hospitals read accepted donor rows" on public.donors;
create policy "Hospitals read accepted donor rows" on public.donors
for select using (
  public.current_profile_role() = 'hospital'
  and exists (
    select 1
    from public.appointments a
    where a.donor_id = donors.id
      and a.hospital_id = public.current_profile_entity()
  )
);
