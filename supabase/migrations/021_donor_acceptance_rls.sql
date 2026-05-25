-- Allow real donor acceptance while keeping hospital/admin protections.

create or replace function public.current_donor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select d.id
  from public.donors d
  left join public.users u on u.id = d.user_id
  where d.user_id = auth.uid()
     or d.auth_user_id = auth.uid()
     or u.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_donor_province()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select d.province
  from public.donors d
  left join public.users u on u.id = d.user_id
  where d.user_id = auth.uid()
     or d.auth_user_id = auth.uid()
     or u.auth_user_id = auth.uid()
  limit 1
$$;

drop policy if exists "Donors accept compatible requests" on public.blood_requests;
create policy "Donors accept compatible requests" on public.blood_requests
for update using (
  public.current_profile_role() = 'donor'
  and status in ('Aberto', 'Em Correspondência')
  and (province is null or province = public.current_donor_province())
)
with check (
  public.current_profile_role() = 'donor'
  and status = 'Doador a Caminho'
);

drop policy if exists "Donors create own appointments strict" on public.appointments;
create policy "Donors create own appointments strict" on public.appointments
for insert with check (
  public.current_profile_role() = 'donor'
  and donor_id = public.current_donor_id()
);
