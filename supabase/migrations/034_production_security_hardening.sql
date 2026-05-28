-- Production security hardening for pilot launch.
-- Idempotent: tightens RLS and adds PIN attempt controls without deleting data.

alter table public.donor_responses
  add column if not exists failed_pin_attempts integer not null default 0,
  add column if not exists last_pin_attempt_at timestamptz,
  add column if not exists pin_locked_until timestamptz;

alter table public.users enable row level security;
alter table public.donors enable row level security;
alter table public.hospitals enable row level security;
alter table public.blood_requests enable row level security;
alter table public.donor_responses enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.rewards enable row level security;

drop policy if exists "Authenticated users create notifications" on public.notifications;
drop policy if exists "Authenticated users create rewards" on public.rewards;
drop policy if exists "Authenticated users create audit logs" on public.audit_logs;
drop policy if exists "Public can read verified hospitals" on public.hospitals;

drop policy if exists "Users owner read" on public.users;
drop policy if exists "Users owner insert" on public.users;
drop policy if exists "Users owner update" on public.users;
drop policy if exists "Users admin read" on public.users;

create policy "Users owner read" on public.users
for select using (auth_user_id = auth.uid() or id = auth.uid() or public.is_admin());

create policy "Users owner insert" on public.users
for insert with check (auth_user_id = auth.uid() or id = auth.uid() or public.is_admin());

create policy "Users owner update" on public.users
for update using (auth_user_id = auth.uid() or id = auth.uid() or public.is_admin())
with check (auth_user_id = auth.uid() or id = auth.uid() or public.is_admin());

drop policy if exists "Donors select own row" on public.donors;
drop policy if exists "Donors insert own row" on public.donors;
drop policy if exists "Donors update own row" on public.donors;
drop policy if exists "Admins manage donors" on public.donors;
drop policy if exists "Hospitals read accepted donors" on public.donors;
drop policy if exists "Hospitals update completed donor operations" on public.donors;

create policy "Donors select own row" on public.donors
for select using (user_id = auth.uid() or auth_user_id = auth.uid() or public.is_admin());

create policy "Donors insert own row" on public.donors
for insert with check (user_id = auth.uid() or auth_user_id = auth.uid() or public.is_admin());

create policy "Donors update own row" on public.donors
for update using (user_id = auth.uid() or auth_user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or auth_user_id = auth.uid() or public.is_admin());

create policy "Hospitals read accepted donors" on public.donors
for select using (
  public.current_profile_role() = 'hospital'
  and exists (
    select 1 from public.donor_responses dr
    where dr.donor_id = donors.id
      and dr.hospital_id = public.current_profile_entity()
  )
);

create policy "Hospitals update completed donor operations" on public.donors
for update using (
  public.current_profile_role() = 'hospital'
  and exists (
    select 1 from public.donor_responses dr
    where dr.donor_id = donors.id
      and dr.hospital_id = public.current_profile_entity()
  )
)
with check (
  public.current_profile_role() = 'hospital'
  and exists (
    select 1 from public.donor_responses dr
    where dr.donor_id = donors.id
      and dr.hospital_id = public.current_profile_entity()
  )
);

drop policy if exists "Hospitals owner read" on public.hospitals;
drop policy if exists "Hospitals owner update" on public.hospitals;
drop policy if exists "Hospitals admin all" on public.hospitals;
drop policy if exists "Hospitals authenticated verified read" on public.hospitals;

create policy "Hospitals authenticated verified read" on public.hospitals
for select using (auth.uid() is not null and (verified = true or public.is_admin() or id = public.current_profile_entity()));

create policy "Hospitals owner update" on public.hospitals
for update using (id = public.current_profile_entity() or public.is_admin())
with check (id = public.current_profile_entity() or public.is_admin());

drop policy if exists "Requests admin all" on public.blood_requests;
drop policy if exists "Requests hospital all own" on public.blood_requests;
drop policy if exists "Requests donor read nearby open" on public.blood_requests;
drop policy if exists "Requests donor accepted status update" on public.blood_requests;

create policy "Requests admin all" on public.blood_requests
for all using (public.is_admin()) with check (public.is_admin());

create policy "Requests hospital all own" on public.blood_requests
for all using (hospital_id = public.current_profile_entity())
with check (hospital_id = public.current_profile_entity());

create policy "Requests donor read open" on public.blood_requests
for select using (
  public.current_profile_role() = 'donor'
  and status in ('Aberto', 'Em Correspondência')
);

create policy "Requests donor accepted status update" on public.blood_requests
for update using (
  public.current_profile_role() = 'donor'
  and exists (
    select 1 from public.donor_responses dr
    where dr.blood_request_id = blood_requests.id
      and dr.donor_id = public.current_profile_entity()
  )
)
with check (
  status in ('Doador a Caminho', 'Agendado')
);

drop policy if exists "Donor responses donor insert" on public.donor_responses;
drop policy if exists "Donor responses donor read" on public.donor_responses;
drop policy if exists "Donor responses hospital read" on public.donor_responses;
drop policy if exists "Donor responses hospital update" on public.donor_responses;
drop policy if exists "Donor responses admin all" on public.donor_responses;

create policy "Donor responses donor insert" on public.donor_responses
for insert with check (donor_id = public.current_profile_entity() or public.is_admin());

create policy "Donor responses donor read" on public.donor_responses
for select using (donor_id = public.current_profile_entity() or public.is_admin());

create policy "Donor responses hospital read" on public.donor_responses
for select using (hospital_id = public.current_profile_entity() or public.is_admin());

create policy "Donor responses hospital update" on public.donor_responses
for update using (hospital_id = public.current_profile_entity() or public.is_admin())
with check (hospital_id = public.current_profile_entity() or public.is_admin());

drop policy if exists "Users read own notifications" on public.notifications;
drop policy if exists "Admins read all notifications" on public.notifications;
drop policy if exists "Notifications owner read update" on public.notifications;
drop policy if exists "Notifications owner read" on public.notifications;
drop policy if exists "Notifications owner update" on public.notifications;
drop policy if exists "Notifications authenticated insert" on public.notifications;

create policy "Notifications owner read" on public.notifications
for select using (user_id = auth.uid() or public.is_admin());

create policy "Notifications owner update" on public.notifications
for update using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "Notifications authenticated insert" on public.notifications
for insert with check (auth.uid() is not null);

drop policy if exists "Rewards workflow insert" on public.rewards;
drop policy if exists "Rewards donor read" on public.rewards;
drop policy if exists "Rewards admin read" on public.rewards;

create policy "Rewards donor read" on public.rewards
for select using (donor_id = public.current_profile_entity() or public.is_admin());

create policy "Rewards workflow insert" on public.rewards
for insert with check (
  donor_id = public.current_profile_entity()
  or public.is_admin()
  or exists (
    select 1 from public.donor_responses dr
    where dr.donor_id = donor_id
      and dr.hospital_id = public.current_profile_entity()
  )
);

drop policy if exists "Audit admin read" on public.audit_logs;
drop policy if exists "Audit authenticated insert" on public.audit_logs;

create policy "Audit admin read" on public.audit_logs
for select using (public.is_admin());

create policy "Audit authenticated insert" on public.audit_logs
for insert with check (auth.uid() is not null);
