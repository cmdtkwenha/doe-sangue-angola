-- Standardize family request and account statuses to Angolan Portuguese.

alter table public.family_emergency_requests drop constraint if exists family_emergency_status_check;
alter table public.users drop constraint if exists users_account_status_check;
alter table public.profiles drop constraint if exists profiles_account_status_check;

update public.family_emergency_requests
set status = case status
  when 'pending_review' then 'Pendente'
  when 'approved' then 'Aprovado'
  when 'active' then 'Ativo'
  when 'fulfilled' then 'Resolvido'
  when 'cancelled' then 'Cancelado'
  else status
end;

update public.users
set account_status = case account_status
  when 'active' then 'Ativo'
  when 'suspended' then 'Suspenso'
  else account_status
end
where to_regclass('public.users') is not null;

update public.profiles
set account_status = case account_status
  when 'active' then 'Ativo'
  when 'suspended' then 'Suspenso'
  else account_status
end
where to_regclass('public.profiles') is not null;

alter table public.family_emergency_requests
  add constraint family_emergency_status_check
  check (status in ('Pendente', 'Aprovado', 'Ativo', 'Resolvido', 'Cancelado'));

alter table public.users
  add constraint users_account_status_check
  check (account_status in ('Ativo', 'Suspenso'));

alter table public.profiles
  add constraint profiles_account_status_check
  check (account_status in ('Ativo', 'Suspenso'));

drop policy if exists "Public submit family emergency" on public.family_emergency_requests;
create policy "Public submit family emergency" on public.family_emergency_requests
for insert with check (
  contact_phone is not null
  and hospital_name is not null
  and status = 'Pendente'
);

drop policy if exists "Donors read active family emergency" on public.family_emergency_requests;
create policy "Donors read active family emergency" on public.family_emergency_requests
for select using (
  status in ('Aprovado', 'Ativo')
  and exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role in ('donor', 'admin')
  )
);

drop policy if exists "Hospitals read family emergency" on public.family_emergency_requests;
create policy "Hospitals read family emergency" on public.family_emergency_requests
for select using (
  status in ('Aprovado', 'Ativo')
  and exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role in ('hospital', 'admin')
  )
);
