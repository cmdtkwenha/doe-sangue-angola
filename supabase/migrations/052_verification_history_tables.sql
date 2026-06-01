create table if not exists public.donor_verifications (
  id uuid primary key default extensions.gen_random_uuid(),
  donor_id uuid not null references public.donors(id) on delete cascade,
  verified_by uuid,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint donor_verifications_status_check
    check (status in ('pending', 'verified', 'needs_review', 'rejected', 'suspended'))
);

create table if not exists public.hospital_verifications (
  id uuid primary key default extensions.gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  verified_by uuid,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hospital_verifications_status_check
    check (status in ('pending', 'approved', 'needs_review', 'rejected', 'suspended'))
);

create index if not exists donor_verifications_donor_idx on public.donor_verifications(donor_id);
create index if not exists donor_verifications_status_idx on public.donor_verifications(status);
create index if not exists hospital_verifications_hospital_idx on public.hospital_verifications(hospital_id);
create index if not exists hospital_verifications_status_idx on public.hospital_verifications(status);

alter table public.donor_verifications enable row level security;
alter table public.hospital_verifications enable row level security;

drop policy if exists "Admin manage donor verifications" on public.donor_verifications;
create policy "Admin manage donor verifications" on public.donor_verifications
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manage hospital verifications" on public.hospital_verifications;
create policy "Admin manage hospital verifications" on public.hospital_verifications
for all using (public.is_admin()) with check (public.is_admin());
