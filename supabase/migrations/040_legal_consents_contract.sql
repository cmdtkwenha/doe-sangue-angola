create table if not exists public.legal_consents (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  role text not null check (role in ('admin', 'hospital', 'donor')),
  consent_type text not null,
  version text not null,
  page text not null,
  accepted_at timestamptz not null default now()
);

create index if not exists legal_consents_user_id_idx on public.legal_consents(user_id);
create index if not exists legal_consents_role_idx on public.legal_consents(role);
create index if not exists legal_consents_type_idx on public.legal_consents(consent_type);

alter table public.legal_consents enable row level security;

drop policy if exists "Users can create own legal consent" on public.legal_consents;
drop policy if exists "Users can read own legal consent" on public.legal_consents;

create policy "Users can create own legal consent"
on public.legal_consents
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can read own legal consent"
on public.legal_consents
for select
to authenticated
using (user_id = auth.uid());
