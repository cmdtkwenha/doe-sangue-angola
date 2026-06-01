-- Pilot tester feedback and issue reporting.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.pilot_feedback (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid,
  role text not null,
  page text not null,
  issue_type text not null,
  severity text not null default 'medium',
  description text not null,
  contact text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pilot_feedback
add column if not exists user_id uuid,
add column if not exists role text not null default 'donor',
add column if not exists page text not null default 'Não indicado',
add column if not exists issue_type text not null default 'other',
add column if not exists severity text not null default 'medium',
add column if not exists description text not null default 'Sem descrição',
add column if not exists contact text,
add column if not exists status text not null default 'open',
add column if not exists updated_at timestamptz not null default now();

alter table public.pilot_feedback
drop constraint if exists pilot_feedback_issue_type_check,
add constraint pilot_feedback_issue_type_check
check (issue_type in ('bug', 'login_problem', 'request_problem', 'pin_problem', 'notification_problem', 'ui_confusion', 'other'));

alter table public.pilot_feedback
drop constraint if exists pilot_feedback_severity_check,
add constraint pilot_feedback_severity_check
check (severity in ('low', 'medium', 'high', 'critical'));

alter table public.pilot_feedback
drop constraint if exists pilot_feedback_status_check,
add constraint pilot_feedback_status_check
check (status in ('open', 'in_progress', 'resolved'));

create index if not exists pilot_feedback_created_idx on public.pilot_feedback(created_at desc);
create index if not exists pilot_feedback_status_idx on public.pilot_feedback(status);
create index if not exists pilot_feedback_severity_idx on public.pilot_feedback(severity);

alter table public.pilot_feedback enable row level security;

drop policy if exists "Users create pilot feedback" on public.pilot_feedback;
create policy "Users create pilot feedback" on public.pilot_feedback
for insert with check (auth.uid() is not null and (user_id is null or user_id = auth.uid()));

drop policy if exists "Users read own pilot feedback" on public.pilot_feedback;
create policy "Users read own pilot feedback" on public.pilot_feedback
for select using (public.is_admin() or user_id = auth.uid());

drop policy if exists "Admins update pilot feedback" on public.pilot_feedback;
create policy "Admins update pilot feedback" on public.pilot_feedback
for update using (public.is_admin()) with check (public.is_admin());
