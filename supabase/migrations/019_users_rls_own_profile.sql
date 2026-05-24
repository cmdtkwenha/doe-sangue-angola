-- Repairs public.users RLS for Supabase Auth profile sync.
-- Safe for production: changes policies only, no rows are deleted.

alter table public.users enable row level security;

drop policy if exists "Users read own profile" on public.users;
drop policy if exists "Users create own profile" on public.users;
drop policy if exists "Users update own profile" on public.users;
drop policy if exists "Admins read all users" on public.users;
drop policy if exists "Users owner select" on public.users;
drop policy if exists "Users owner insert" on public.users;
drop policy if exists "Users owner update" on public.users;
drop policy if exists "Users admin select" on public.users;

create policy "Users owner select" on public.users
for select using (
  id = auth.uid()
  or auth_user_id = auth.uid()
  or public.is_admin()
);

create policy "Users owner insert" on public.users
for insert with check (
  id = auth.uid()
  or auth_user_id = auth.uid()
  or public.is_admin()
);

create policy "Users owner update" on public.users
for update using (
  id = auth.uid()
  or auth_user_id = auth.uid()
  or public.is_admin()
) with check (
  id = auth.uid()
  or auth_user_id = auth.uid()
  or public.is_admin()
);

create policy "Users admin select" on public.users
for select using (public.is_admin());
