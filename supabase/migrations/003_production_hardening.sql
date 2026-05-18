-- Production hardening for Doe Sangue Angola.
-- Adds indexes and role-aware RLS policies without removing mock fallback.

create index if not exists users_auth_user_id_idx on public.users(auth_user_id);
create index if not exists users_role_idx on public.users(role);
create index if not exists donors_user_id_idx on public.donors(user_id);
create index if not exists donors_blood_type_idx on public.donors(blood_type);
create index if not exists hospitals_user_id_idx on public.hospitals(user_id);
create index if not exists blood_requests_hospital_status_idx
  on public.blood_requests(hospital_id, status);
create index if not exists appointments_donor_idx on public.appointments(donor_id);
create index if not exists appointments_hospital_idx on public.appointments(hospital_id);
create index if not exists notifications_user_read_idx on public.notifications(user_id, read);
create index if not exists rewards_donor_idx on public.rewards(donor_id);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.current_user_row_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.users where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'admin'
$$;

create or replace function public.owns_hospital(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.hospitals
    where id = target and user_id = public.current_user_row_id()
  )
$$;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Admins read all users') then
    create policy "Admins read all users" on public.users
      for select using (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins manage hospitals') then
    create policy "Admins manage hospitals" on public.hospitals
      for all using (public.is_admin()) with check (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Hospitals read own hospital') then
    create policy "Hospitals read own hospital" on public.hospitals
      for select using (user_id = public.current_user_row_id());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins read all donors') then
    create policy "Admins read all donors" on public.donors
      for select using (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins read all requests') then
    create policy "Admins read all requests" on public.blood_requests
      for select using (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Hospitals create own requests') then
    create policy "Hospitals create own requests" on public.blood_requests
      for insert with check (public.owns_hospital(hospital_id));
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins read all appointments') then
    create policy "Admins read all appointments" on public.appointments
      for select using (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Hospitals read own appointments') then
    create policy "Hospitals read own appointments" on public.appointments
      for select using (public.owns_hospital(hospital_id));
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Donors read own appointments') then
    create policy "Donors read own appointments" on public.appointments
      for select using (
        donor_id in (select id from public.donors where user_id = public.current_user_row_id())
      );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Users update own notifications') then
    create policy "Users update own notifications" on public.notifications
      for update using (user_id = public.current_user_row_id());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins read audit logs') then
    create policy "Admins read audit logs" on public.audit_logs
      for select using (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins manage fraud reviews') then
    create policy "Admins manage fraud reviews" on public.fraud_reviews
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;
