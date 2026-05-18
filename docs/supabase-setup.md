# Supabase Setup

Doe Sangue Angola now has two data modes:

- `mock`: default, safe for demos and offline development.
- `supabase`: reads and writes through Supabase repositories when env keys exist.

If `NEXT_PUBLIC_DATA_MODE=supabase` but keys are missing, the app keeps mock
fallback active and reports: `Supabase selecionado, mas variáveis públicas em falta.`

## Tables

The migrations create the required Phase 2 tables:

- `users`
- `donors`
- `hospitals`
- `blood_requests`
- `appointments`
- `notifications`
- `rewards`
- `audit_logs`
- `fraud_reviews`

Extra prepared tables:

- `referrals`
- `family_emergency_requests`
- `push_tokens`
- `notification_preferences`

## Files

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_push_notifications.sql`
- `supabase/seed/seed_data.sql`
- `supabase/seed/pilot_seed.sql`
- `apps/web/lib/supabaseClient.ts`
- `apps/mobile/lib/supabaseClient.ts`
- `packages/shared-services/src/repositories/*Repository.ts`

## Environment

For web, create `.env.local`:

```bash
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_PUSH_MODE=expo
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=server-only-key
```

For Expo/EAS:

```bash
EXPO_PUBLIC_DATA_MODE=supabase
EXPO_PUBLIC_AUTH_MODE=supabase
EXPO_PUBLIC_PUSH_MODE=expo
EXPO_PUBLIC_API_URL=https://your-vercel-url
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in Expo public variables.

## Apply Database

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

For demo data:

```bash
npx supabase db execute --file supabase/seed/seed_data.sql
```

For pilot data:

```bash
npx supabase db execute --file supabase/seed/pilot_seed.sql
```

## Repository Flow

The production path goes through `dataProvider`:

1. `NEXT_PUBLIC_DATA_MODE=mock` uses `mockProvider`.
2. `NEXT_PUBLIC_DATA_MODE=supabase` plus valid keys uses `supabaseProvider`.
3. Missing Supabase keys falls back to mock and exposes a clear status message.

Critical real-data flow:

1. Hospital creates `blood_requests`.
2. Matching reads `donors`.
3. Notifications write `notifications`.
4. Donor accepts and creates `appointments` with a PIN.
5. Hospital validates PIN and updates the request.
6. Completion writes `rewards` and `audit_logs`.

## RLS Notes

RLS is enabled on the planned tables. Before public launch, add admin policies
for national dashboards, fraud review and audit review. Keep hospital policies
scoped to the hospital user and donor policies scoped to the donor user.
