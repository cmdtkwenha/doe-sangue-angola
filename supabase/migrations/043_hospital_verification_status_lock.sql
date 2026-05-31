-- Locks hospital verification workflow status into production schema.

alter table public.hospitals
add column if not exists verification_status text not null default 'pending',
add column if not exists rejection_reason text;

update public.hospitals
set verification_status = case
  when verification_status in ('pending', 'verified', 'rejected', 'suspended')
    then verification_status
  when verified = true then 'verified'
  else 'pending'
end;

alter table public.hospitals
drop constraint if exists hospitals_verification_status_check,
add constraint hospitals_verification_status_check
check (verification_status in ('pending', 'verified', 'rejected', 'suspended'));

create index if not exists hospitals_verification_status_idx
on public.hospitals(verification_status);

drop policy if exists "Hospitals create own requests" on public.blood_requests;
drop policy if exists "Hospitals manage own requests" on public.blood_requests;
drop policy if exists "Requests hospital all own" on public.blood_requests;
drop policy if exists "Requests hospital insert linked profile" on public.blood_requests;

create policy "Requests verified hospital insert" on public.blood_requests
for insert with check (
  public.is_admin()
  or (
    hospital_id = public.current_profile_entity()
    and exists (
      select 1 from public.hospitals h
      where h.id = hospital_id
        and h.verified = true
        and h.verification_status = 'verified'
    )
  )
);

create policy "Requests hospital read own verified workflow" on public.blood_requests
for select using (public.is_admin() or hospital_id = public.current_profile_entity());

create policy "Requests hospital update own verified workflow" on public.blood_requests
for update using (public.is_admin() or hospital_id = public.current_profile_entity())
with check (public.is_admin() or hospital_id = public.current_profile_entity());
