-- Real donor profiles linked directly to Supabase Auth.

alter table public.donors
  add column if not exists auth_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists gender text,
  add column if not exists last_donation_date date,
  add column if not exists total_donations integer not null default 0,
  add column if not exists eligibility_status text not null default 'Pendente';

update public.donors d
set auth_user_id = coalesce(d.auth_user_id, u.auth_user_id),
    full_name = coalesce(d.full_name, u.name),
    email = coalesce(d.email, u.email),
    phone = coalesce(d.phone, u.phone),
    last_donation_date = coalesce(d.last_donation_date, d.last_donation)
from public.users u
where d.user_id = u.id;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'donors_auth_user_id_unique'
  ) then
    alter table public.donors
      add constraint donors_auth_user_id_unique unique (auth_user_id);
  end if;
end $$;

create index if not exists donors_province_municipality_idx
  on public.donors(province, municipality);
create index if not exists donors_eligibility_idx
  on public.donors(eligibility_status);

create or replace function public.current_donor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.donors
  where auth_user_id = auth.uid()
     or user_id = public.current_user_row_id()
  limit 1
$$;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Donors manage own donor auth row') then
    create policy "Donors manage own donor auth row" on public.donors
      for all using (auth_user_id = auth.uid() or user_id = public.current_user_row_id())
      with check (auth_user_id = auth.uid() or user_id = public.current_user_row_id());
  end if;
end $$;
