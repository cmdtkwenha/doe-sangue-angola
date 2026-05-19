-- Links public profiles to Supabase Auth and tightens production access.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_auth_user_id_fkey'
  ) then
    alter table public.users
      add constraint users_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'blood_requests_status_check'
  ) then
    alter table public.blood_requests
      add constraint blood_requests_status_check
      check (status in (
        'Aberto',
        'Em Correspondência',
        'Agendado',
        'Doador a Caminho',
        'PIN Validado',
        'Concluído',
        'Cancelado',
        'Triagem',
        'Concluido'
      ));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'appointments_status_check'
  ) then
    alter table public.appointments
      add constraint appointments_status_check
      check (status in ('Confirmado', 'Pendente', 'Concluido'));
  end if;
end $$;

create or replace function public.current_donor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.donors where user_id = public.current_user_row_id() limit 1
$$;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Users update own profile') then
    create policy "Users update own profile" on public.users
      for update using (id = public.current_user_row_id())
      with check (id = public.current_user_row_id());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Donors update own donor row') then
    create policy "Donors update own donor row" on public.donors
      for update using (user_id = public.current_user_row_id())
      with check (user_id = public.current_user_row_id());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Hospitals update own hospital') then
    create policy "Hospitals update own hospital" on public.hospitals
      for update using (user_id = public.current_user_row_id())
      with check (user_id = public.current_user_row_id());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Donors read compatible open requests') then
    create policy "Donors read compatible open requests" on public.blood_requests
      for select using (
        status not in ('Concluído', 'Concluido', 'Cancelado')
        and public.current_app_role() = 'donor'
      );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Donors create own appointments') then
    create policy "Donors create own appointments" on public.appointments
      for insert with check (donor_id = public.current_donor_id());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Hospitals update own appointments') then
    create policy "Hospitals update own appointments" on public.appointments
      for update using (public.owns_hospital(hospital_id))
      with check (public.owns_hospital(hospital_id));
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Donors read own rewards') then
    create policy "Donors read own rewards" on public.rewards
      for select using (donor_id = public.current_donor_id());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins read all rewards') then
    create policy "Admins read all rewards" on public.rewards
      for select using (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Admins read all notifications') then
    create policy "Admins read all notifications" on public.notifications
      for select using (public.is_admin());
  end if;
end $$;
