-- Reset only pilot test data. Do not run against unreviewed production data.
begin;

delete from public.donor_responses
where donor_id in (
  select id from public.donors where email like '%@pilot.doesangue.ao'
)
or blood_request_id in (
  select id from public.blood_requests where notes = 'PILOT_SEED'
);

delete from public.appointments
where donor_id in (
  select id from public.donors where email like '%@pilot.doesangue.ao'
)
or blood_request_id in (
  select id from public.blood_requests where notes = 'PILOT_SEED'
);

delete from public.notifications
where user_id in (
  select id from public.users where email like '%@pilot.doesangue.ao'
);

delete from public.rewards
where donor_id in (
  select id from public.donors where email like '%@pilot.doesangue.ao'
);

delete from public.blood_requests
where notes = 'PILOT_SEED';

delete from public.audit_logs
where actor_label = 'PILOT_SEED'
or action like 'PILOT_SEED:%';

delete from public.donors
where email like '%@pilot.doesangue.ao';

delete from public.profiles
where email like '%@pilot.doesangue.ao';

delete from public.users
where email like '%@pilot.doesangue.ao';

commit;
