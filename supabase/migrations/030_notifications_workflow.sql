-- Real in-app notifications for workflow events.

create table if not exists public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  role text not null default 'donor',
  title text not null,
  message text,
  body text,
  type text not null default 'workflow',
  read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications
  add column if not exists role text not null default 'donor',
  add column if not exists message text,
  add column if not exists read_at timestamptz;

update public.notifications
set message = coalesce(message, body)
where message is null;

create index if not exists notifications_user_created_idx
  on public.notifications(user_id, created_at desc);
create index if not exists notifications_role_created_idx
  on public.notifications(role, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications(user_id, read_at)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications" on public.notifications
for select using (
  public.is_admin()
  or user_id in (select id from public.users where auth_user_id = auth.uid())
);

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications" on public.notifications
for update using (
  public.is_admin()
  or user_id in (select id from public.users where auth_user_id = auth.uid())
)
with check (
  public.is_admin()
  or user_id in (select id from public.users where auth_user_id = auth.uid())
);

drop policy if exists "Authenticated users create notifications" on public.notifications;
create policy "Authenticated users create notifications" on public.notifications
for insert with check (auth.uid() is not null);

alter table public.notifications replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
exception
  when undefined_object then null;
end $$;
