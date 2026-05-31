-- Doe Sangue Angola pilot workflow reset.
-- Use before a fresh end-to-end pilot test.
--
-- Preserved:
-- - auth.users
-- - public.users
-- - public.profiles
-- - public.donors
-- - public.hospitals
-- - public.legal_consents
--
-- Deleted:
-- - public.donor_responses
-- - public.blood_requests
-- - public.notifications
-- - public.audit_logs
-- - public.appointments, when the table exists
--
-- Run in Supabase SQL Editor or with:
-- supabase db execute --file scripts/reset-pilot-workflow-data.sql
--
-- This script is intentionally scoped to workflow data only.

begin;

do $$
begin
  if to_regclass('public.appointments') is not null then
    delete from public.appointments;
  end if;

  if to_regclass('public.donor_responses') is not null then
    delete from public.donor_responses;
  end if;

  if to_regclass('public.notifications') is not null then
    delete from public.notifications;
  end if;

  if to_regclass('public.audit_logs') is not null then
    delete from public.audit_logs;
  end if;

  if to_regclass('public.blood_requests') is not null then
    delete from public.blood_requests;
  end if;
end $$;

commit;
