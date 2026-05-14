# Supabase setup

Doe Sangue Angola is still running with mock services. These files prepare the
backend path without switching the product to live data.

## Files

- `supabase/migrations/001_initial_schema.sql`: initial tables and starter RLS.
- `supabase/seed/seed_data.sql`: demo data matching the current mock platform.
- `apps/web/lib/supabaseClient.ts`: web client adapter.
- `apps/mobile/lib/supabaseClient.ts`: Expo client adapter.
- `.env.example`: environment variable template.

## Environment variables

Copy `.env.example` to `.env.local` for web development.

Set these when you are ready to test Supabase:

```bash
NEXT_PUBLIC_DATA_MODE=mock
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Do not expose it in Next public
variables or Expo public variables.

## Local Supabase flow

1. Install the Supabase CLI.
2. Run `supabase start`.
3. Apply `supabase/migrations/001_initial_schema.sql`.
4. Load `supabase/seed/seed_data.sql`.
5. Keep the app in mock mode until service functions are intentionally switched.

## RLS notes

RLS is enabled on all planned tables.

Starter policies are intentionally conservative:

- Users read only their own `users` row.
- Public clients can read verified hospitals.
- Donors read only their own donor row.
- Hospitals manage only their own blood requests.
- Users read only their own notifications.

Next policies to add before production:

- Admin role can review hospitals, audit logs, fraud reviews, and national data.
- Hospital role can read matched donor summaries without exposing sensitive data.
- Donor role can accept only compatible, active requests.
- Family emergency links should expose only a public-safe view by `share_token`.
- Audit logs should be insert-only for normal clients.

## Switching from mock to live

The current `supabaseClient.ts` files do not connect live yet. When ready:

1. Install `@supabase/supabase-js`.
2. Switch both client adapters to live `createClient` usage.
3. Implement real queries in `supabaseProvider.ts`.
4. Set `NEXT_PUBLIC_DATA_MODE=supabase`.
5. Keep mock fallbacks for demos and offline development.

This keeps the investor demo stable while the backend is introduced gradually.
