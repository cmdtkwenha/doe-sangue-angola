# Backend Roadmap

The product is currently mock-first. This keeps demos fast and safe while the
backend is prepared carefully.

## Phase 1: Supabase Foundation

- Create the project in Supabase.
- Run `supabase/migrations/001_initial_schema.sql`.
- Load `supabase/seed/seed_data.sql` for demo data.
- Enable Row Level Security on all sensitive tables.
- Keep mock mode available for rehearsals.

## Phase 2: Authentication

- Replace mock login with Supabase Auth.
- Map users to roles: Admin, Hospital/Clinic, and Donor.
- Keep role redirects:
  - Admin: `/admin`
  - Hospital/Clinic: `/hospital`
  - Donor: `/mobile`

## Phase 3: Real Data Services

Move these services from mock adapters to Supabase queries:

- donors
- hospitals
- blood requests
- appointments
- notifications
- audit logs
- fraud reviews

The switch is controlled by `NEXT_PUBLIC_DATA_MODE`.

## Phase 4: Realtime

Use Supabase Realtime for:

- Hospital creates request, Admin updates instantly.
- Donor accepts, Hospital sees incoming donor.
- PIN validation completes the request.
- Audit log records every important action.

## Phase 5: Production Operations

- Add monitoring such as Sentry.
- Add daily database backups.
- Add an incident contact list.
- Review security policies monthly.
