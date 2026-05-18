# Auth Setup

Doe Sangue Angola supports two auth modes:

- `demo`: local development only.
- `supabase`: staging, pilot and production.

Demo accounts are blocked outside `NEXT_PUBLIC_APP_ENV=development`.

## Required Redirects

- `admin` goes to `/admin`
- `hospital` goes to `/hospital`
- `donor` goes to `/mobile`

## Environment

For real auth in `.env.local`:

```bash
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For local demo:

```bash
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_AUTH_MODE=demo
NEXT_PUBLIC_DATA_MODE=mock
```

## Supabase User Role

Each Supabase Auth user must have a matching row in `public.users`.

Required columns:

- `auth_user_id`: Supabase Auth user id.
- `email`: login email.
- `name`: display name.
- `role`: `admin`, `hospital`, or `donor`.

The register form stores role in both:

- Supabase Auth `user_metadata.role`
- `public.users.role`

Login and protected routes read `public.users` when metadata is missing.

## Route Protection

Protected route rules:

- `/admin/*`: admin only.
- `/hospital/*`: hospital only.
- `/mobile/*`: donor only.

If a user is not logged in, they are sent to `/auth`.
If a logged-in user has the wrong role, they are sent to `/unauthorized`.

## Password Reset

Forgot password uses Supabase Auth email recovery. The redirect returns users to
`/auth` after they complete the recovery email flow.

## Pilot Checklist

1. Create Supabase project.
2. Apply migrations.
3. Create Auth users.
4. Add matching rows in `public.users`.
5. Confirm role redirects for each user.
6. Confirm wrong-role access goes to `/unauthorized`.
7. Confirm logout returns to `/auth`.
