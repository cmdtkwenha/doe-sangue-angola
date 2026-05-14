# Environment Variables

Doe Sangue Angola uses mock mode by default. This keeps demos stable while Supabase is prepared.

## Local File

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Never commit `.env.local`.

## Web Variables

```bash
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_DATA_MODE=mock
NEXT_PUBLIC_PILOT_MODE=false
NEXT_PUBLIC_PILOT_SAFE_NOTIFICATIONS=true
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Meaning

- `NEXT_PUBLIC_APP_ENV`: local, preview or production.
- `NEXT_PUBLIC_DATA_MODE`: `mock` or `supabase`.
- `NEXT_PUBLIC_PILOT_MODE`: `true` only for controlled Luanda/Benguela pilot tests.
- `NEXT_PUBLIC_PILOT_SAFE_NOTIFICATIONS`: keeps test notifications inside safe mock flows.
- `NEXT_PUBLIC_SUPABASE_URL`: public Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public Supabase anonymous key.
- `NEXT_PUBLIC_SITE_URL`: public site URL used for metadata and auth redirects.

## Mobile Variables

```bash
EXPO_PUBLIC_APP_ENV=local
EXPO_PUBLIC_DATA_MODE=mock
EXPO_PUBLIC_PILOT_MODE=false
EXPO_PUBLIC_PILOT_SAFE_NOTIFICATIONS=true
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

### Meaning

- `EXPO_PUBLIC_DATA_MODE`: keeps the app in demo mode unless changed.
- `EXPO_PUBLIC_PILOT_MODE`: enables pilot copy and safe test flows.
- `EXPO_PUBLIC_PILOT_SAFE_NOTIFICATIONS`: prevents accidental real pushes during pilot rehearsal.
- `EXPO_PUBLIC_API_URL`: web API base URL for mobile integrations.
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase URL for mobile.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key for mobile.

## Server-Only Variables

```bash
SUPABASE_SERVICE_ROLE_KEY=
SENTRY_DSN=
```

Do not expose server-only keys in browser or mobile bundles.

## Production Guidance

Use mock mode until:

- Supabase RLS is reviewed.
- Auth roles are tested.
- Production keys are stored securely.
- Demo seed data is separated from real data.
