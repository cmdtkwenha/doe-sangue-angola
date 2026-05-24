-- Repairs existing production donors tables that predate emergency contacts.
-- Safe for live data: it only adds missing nullable columns.

alter table public.donors
  add column if not exists emergency_contact_name text;

alter table public.donors
  add column if not exists emergency_contact_phone text;

notify pgrst, 'reload schema';
