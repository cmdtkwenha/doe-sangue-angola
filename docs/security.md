# Security Notes

Doe Sangue Angola handles health-related workflows, so security needs to be
treated as a launch requirement, not a later polish step.

## Current Demo Safety

- The project uses mock data.
- No real patient data should be entered.
- Mock PINs and donor records are for presentation only.

## Before Real Launch

- Enable Supabase Row Level Security.
- Use strong role rules for Admin, Hospital/Clinic, and Donor.
- Store service role keys only on the server.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in web or mobile bundles.
- Add audit logs for every important action.

## Data Rules

- Hospitals should only see their own requests and appointments.
- Donors should only see their own profile, rewards, and appointments.
- Admin users should be limited to approved operators.
- Family emergency requests need verification before broad notification.

## Monitoring

The shared logger is ready for a future monitoring provider. Good options:

- Sentry for app errors.
- Supabase logs for backend events.
- Audit log table for product actions.

## Incident Plan

If something goes wrong:

1. Pause live notifications.
2. Disable affected user account.
3. Export related audit logs.
4. Notify the responsible hospital or admin lead.
5. Fix the issue before re-enabling the flow.
