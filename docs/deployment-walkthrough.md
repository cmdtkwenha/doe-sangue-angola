# Deployment Walkthrough

This guide explains how to prepare Doe Sangue Angola for web deployment, Supabase setup, and GitHub workflow.

## Before Deployment

Run these checks locally:

```bash
npm run check:lines
npm run audit
npm run lint
npm run test
npm run typecheck
npm run build
```

Only deploy when these pass.

## Web Deployment With Vercel

Vercel is the recommended web host for the Admin and Hospital portals.

### Step 1: Push The Project To GitHub

1. Create a private GitHub repository.
2. Push the Doe Sangue Angola project.
3. Do not upload `.env.local`.
4. Keep `.env.example` in the repository.

### Step 2: Create A Vercel Project

1. Open Vercel.
2. Choose "New Project".
3. Import the GitHub repository.
4. Select the web app folder if Vercel asks for the app location.
5. Use the web build command:

```bash
npm run build:web
```

### Step 3: Add Environment Variables

Start in mock mode:

```bash
NEXT_PUBLIC_DATA_MODE=mock
NEXT_PUBLIC_APP_NAME=Doe Sangue Angola
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

When Supabase is ready, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Never expose the Supabase service role key in the browser.

### Step 4: Deploy

Click Deploy in Vercel. After deployment:

1. Open the Vercel URL.
2. Test `/auth`.
3. Test `/admin`.
4. Test `/hospital`.
5. Test `/mobile`.

## Supabase Setup Walkthrough

Supabase should be connected after the mock demo is approved.

### Step 1: Create A Supabase Project

1. Open Supabase.
2. Create a new project.
3. Save the project URL.
4. Save the anon public key.
5. Keep the service role key private.

### Step 2: Run Database Schema

Use the SQL files in this order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_push_notifications.sql`
3. `supabase/seed/seed_data.sql`

### Step 3: Review Security

Before using real data:

1. Review Row Level Security policies.
2. Confirm admin, hospital, and donor permissions.
3. Confirm hospitals cannot see another hospital's private data.
4. Confirm donors cannot see admin-only data.
5. Test with fake pilot accounts first.

### Step 4: Switch Data Mode

Only after testing, change:

```bash
NEXT_PUBLIC_DATA_MODE=supabase
```

Keep mobile aligned:

```bash
EXPO_PUBLIC_DATA_MODE=supabase
```

## GitHub Workflow Explanation

GitHub is where the code lives and where changes are reviewed.

Recommended workflow:

1. Keep `main` as the stable branch.
2. Create a new branch for each change.
3. Open a pull request.
4. Wait for GitHub Actions checks.
5. Review the change.
6. Merge only when checks pass.

The included CI workflow runs:

- File length check.
- Tests.
- Typecheck.

## Founder-Friendly Release Steps

1. Ask the technical team to confirm checks pass.
2. Review the Vercel preview link.
3. Test the demo accounts.
4. Confirm the app is still in mock mode unless the pilot is approved.
5. Approve deployment to production.

## Rollback Plan

If a deployment has a problem:

1. Open Vercel.
2. Go to Deployments.
3. Pick the last working deployment.
4. Click Redeploy or Promote.
5. Tell the team what went wrong.

## Production Safety Notes

- Do not use real patient information in mock mode.
- Do not switch to Supabase until security is reviewed.
- Do not share private environment keys.
- Keep pilot launch limited to approved hospitals and donors.
