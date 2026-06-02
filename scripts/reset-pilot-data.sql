-- Doe Sangue Angola: safe pilot database reset.
-- WARNING: Run only after taking a Supabase backup/export.
-- This wipes pilot operational data and non-admin public accounts.
-- It does not drop tables, delete migrations, or delete auth.users.
-- The public admin account admin@sangueangola.ao is preserved.

begin;

create temp table pilot_reset_counts (
  phase text not null,
  table_name text not null,
  row_count bigint
) on commit drop;

do $$
declare
  table_name text;
  tables text[] := array[
    'audit_logs',
    'notifications',
    'pilot_feedback',
    'request_acceptances',
    'donor_responses',
    'appointments',
    'blood_requests',
    'hospital_inventory_movements',
    'inventory_movements',
    'hospital_inventory',
    'donor_verifications',
    'hospital_verifications',
    'hospital_notification_preferences',
    'hospital_staff',
    'donors',
    'hospitals',
    'profiles',
    'users'
  ];
begin
  foreach table_name in array tables loop
    if to_regclass('public.' || table_name) is not null then
      execute format(
        'insert into pilot_reset_counts select %L, %L, count(*) from public.%I',
        'before',
        table_name,
        table_name
      );
    else
      insert into pilot_reset_counts values ('before', table_name, null);
    end if;
  end loop;
end $$;

select phase, table_name, row_count
from pilot_reset_counts
where phase = 'before'
order by table_name;

do $$
begin
  if to_regclass('public.audit_logs') is not null then
    delete from public.audit_logs;
  end if;
  if to_regclass('public.notifications') is not null then
    delete from public.notifications;
  end if;
  if to_regclass('public.pilot_feedback') is not null then
    delete from public.pilot_feedback;
  end if;
  if to_regclass('public.request_acceptances') is not null then
    delete from public.request_acceptances;
  end if;
  if to_regclass('public.donor_responses') is not null then
    delete from public.donor_responses;
  end if;
  if to_regclass('public.appointments') is not null then
    delete from public.appointments;
  end if;
  if to_regclass('public.blood_requests') is not null then
    delete from public.blood_requests;
  end if;
  if to_regclass('public.hospital_inventory_movements') is not null then
    delete from public.hospital_inventory_movements;
  end if;
  if to_regclass('public.inventory_movements') is not null then
    delete from public.inventory_movements;
  end if;
  if to_regclass('public.hospital_inventory') is not null then
    delete from public.hospital_inventory;
  end if;
  if to_regclass('public.donor_verifications') is not null then
    delete from public.donor_verifications;
  end if;
  if to_regclass('public.hospital_verifications') is not null then
    delete from public.hospital_verifications;
  end if;
  if to_regclass('public.hospital_notification_preferences') is not null then
    delete from public.hospital_notification_preferences;
  end if;
  if to_regclass('public.hospital_staff') is not null then
    delete from public.hospital_staff;
  end if;
  if to_regclass('public.donors') is not null then
    delete from public.donors;
  end if;
  if to_regclass('public.hospitals') is not null then
    delete from public.hospitals;
  end if;
  if to_regclass('public.profiles') is not null then
    delete from public.profiles
    where coalesce(email, '') <> 'admin@sangueangola.ao';
  end if;
  if to_regclass('public.users') is not null then
    delete from public.users
    where email <> 'admin@sangueangola.ao';
  end if;
end $$;

do $$
declare
  table_name text;
  tables text[] := array[
    'audit_logs',
    'notifications',
    'pilot_feedback',
    'request_acceptances',
    'donor_responses',
    'appointments',
    'blood_requests',
    'hospital_inventory_movements',
    'inventory_movements',
    'hospital_inventory',
    'donor_verifications',
    'hospital_verifications',
    'hospital_notification_preferences',
    'hospital_staff',
    'donors',
    'hospitals',
    'profiles',
    'users'
  ];
begin
  foreach table_name in array tables loop
    if to_regclass('public.' || table_name) is not null then
      execute format(
        'insert into pilot_reset_counts select %L, %L, count(*) from public.%I',
        'after',
        table_name,
        table_name
      );
    else
      insert into pilot_reset_counts values ('after', table_name, null);
    end if;
  end loop;
end $$;

select phase, table_name, row_count
from pilot_reset_counts
where phase = 'after'
order by table_name;

commit;
