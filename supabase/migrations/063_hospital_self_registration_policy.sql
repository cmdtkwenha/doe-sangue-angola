-- Allow authenticated hospital accounts to submit a pending institution for admin verification.
-- This is not public write access: the account must already have role hospital.

drop policy if exists "Hospitals self register pending institution" on public.hospitals;

create policy "Hospitals self register pending institution"
on public.hospitals
for insert
with check (
  public.current_profile_role() = 'hospital'
  and verified = false
  and coalesce(verification_status, 'Pendente') = 'Pendente'
);
