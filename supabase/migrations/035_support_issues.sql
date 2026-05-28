create table if not exists public.support_issues (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  role text not null check (role in ('admin', 'hospital', 'donor')),
  page text not null,
  action text not null,
  type text not null,
  message text not null,
  status text not null default 'Aberto',
  created_at timestamptz not null default now()
);

create index if not exists support_issues_user_id_idx on public.support_issues(user_id);
create index if not exists support_issues_role_idx on public.support_issues(role);
create index if not exists support_issues_status_idx on public.support_issues(status);

alter table public.support_issues enable row level security;

drop policy if exists "Admins can read support issues" on public.support_issues;
drop policy if exists "Users can create support issues" on public.support_issues;
drop policy if exists "Users can read own support issues" on public.support_issues;

create policy "Users can create support issues"
on public.support_issues
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can read own support issues"
on public.support_issues
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can read support issues"
on public.support_issues
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role = 'admin'
  )
);
