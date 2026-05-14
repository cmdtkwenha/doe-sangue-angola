# Deployment

Doe Sangue Angola is ready for a safe investor demo deployment. The web app can
go to Vercel, the mobile app can go through Expo, and Supabase remains planned
while mock data stays active.

## What Gets Deployed

- Web: Admin Portal, Hospital Portal, and mobile preview at `/mobile`.
- Mobile: Expo donor app in `apps/mobile`.
- Backend: not live yet. The app still uses mock services by default.

## Web Deployment on Vercel

1. Create a Vercel project from this repository.
2. Use `npm install` as the install command.
3. Use `npm run build:web` as the build command.
4. Keep the output directory as `apps/web/.next`.
5. Add environment variables from `.env.example`.

For demo mode, keep:

```bash
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_DATA_MODE=mock
```

Switch to Supabase only after the backend tables, RLS policies, and auth flow
are verified.

## Local Production Check

Run these before a demo:

```bash
npm run check:lines
npm run test
npm run typecheck
npm run build:web
```

## Folder Cleanup

Do not upload these folders manually:

- `node_modules`
- `.next`
- `.expo`
- `dist`
- `build`

They are already ignored in `.gitignore`.

## Owner Checklist

- Confirm Portuguese text is correct.
- Confirm demo data does not contain real patient information.
- Confirm all dashboards load on a laptop and tablet.
- Keep `NEXT_PUBLIC_DATA_MODE=mock` until Supabase is approved.
