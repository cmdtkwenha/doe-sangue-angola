# Vercel Production

This guide deploys the web platform to Vercel.

The web platform includes:

- Admin Portal at `/admin`
- Hospital Portal at `/hospital`
- Donor preview at `/mobile`
- API routes for requests, appointments, notifications and push tokens

## Project Settings

In Vercel, create a new project from the GitHub repository.

Use these settings:

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Install Command | `npm install` |
| Build Command | `npm run build:web` |
| Output Directory | `apps/web/.next` |
| Root Directory | Repository root |

The repository already includes `vercel.json` with these defaults.

## Production Variables

Add these in Vercel Project Settings:

```bash
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_DATA_MODE=supabase
NEXT_PUBLIC_PUSH_MODE=expo
NEXT_PUBLIC_MONITORING_ENABLED=true
NEXT_PUBLIC_SITE_URL=https://doesangue.ao
NEXT_PUBLIC_API_URL=https://doesangue.ao
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SENTRY_DSN=
```

Use `.env.production.example` or `env/vercel.production.example` as the source
template. Keep secret values inside Vercel only.

## Supabase Redirect URLs

In Supabase Authentication settings, add:

- `https://doesangue.ao/auth`
- `https://doesangue.ao/auth/register`
- `https://doesangue.ao/auth/forgot-password`
- Vercel preview URL if testing previews

## Deploy Steps

1. Push the final branch to GitHub.
2. Open Vercel and import the project.
3. Add production variables.
4. Deploy a preview first.
5. Test login and route protection.
6. Promote to production when checks pass.

## Post-Deploy Checks

Open these routes:

- `/auth`
- `/admin`
- `/hospital`
- `/mobile`
- `/api/health`

Then verify the critical flow:

1. Hospital creates request.
2. Admin sees request.
3. Donor accepts request.
4. PIN is generated.
5. Hospital validates PIN.
6. Request becomes completed.
7. Rewards, notifications and audit logs persist.

## Common Issues

If Supabase queries fail, check:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- RLS policies

If the app must stay online during a backend issue, switch:

```bash
NEXT_PUBLIC_DATA_MODE=mock
NEXT_PUBLIC_PUSH_MODE=mock
```
