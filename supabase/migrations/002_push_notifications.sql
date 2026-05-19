create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.push_tokens (
  id uuid primary key default extensions.gen_random_uuid(),
  donor_id uuid not null references public.donors(id) on delete cascade,
  token text not null unique,
  platform text not null default 'unknown',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  id uuid primary key default extensions.gen_random_uuid(),
  donor_id uuid not null unique references public.donors(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;
alter table public.notification_preferences enable row level security;

create policy "Donors manage own push tokens"
on public.push_tokens for all using (
  donor_id in (
    select d.id from public.donors d
    join public.users u on u.id = d.user_id
    where u.auth_user_id = auth.uid()
  )
);

create policy "Donors manage own notification preferences"
on public.notification_preferences for all using (
  donor_id in (
    select d.id from public.donors d
    join public.users u on u.id = d.user_id
    where u.auth_user_id = auth.uid()
  )
);
