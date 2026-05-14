# Next Actions

These are recommended next steps after the build-status review. They are ordered to reduce risk first.

## Immediate Actions

1. Decide the official auth mode for demos and staging.
2. Update auth behavior so demo mode does not show Supabase setup warnings.
3. Change mobile production EAS data mode to match current backend readiness.
4. Document which empty placeholder directories should stay and which should be removed.

## This Week

1. Create route smoke tests for:
   - `/auth`
   - `/admin`
   - `/hospital`
   - `/mobile`
   - `/admin/audit`
   - `/admin/requests`
2. Run a manual UI workflow check:
   - Admin login
   - Hospital login
   - Donor login
   - Hospital creates request
   - Donor accepts
   - PIN validates
   - Request completes
   - Audit log updates
3. Move one service at a time from direct `mockData` reads to repository interfaces.

## Before Staging

1. Confirm environment variables for staging.
2. Confirm Supabase project and RLS policies if staging uses real data.
3. Keep `NEXT_PUBLIC_DATA_MODE=mock` if real data access is not ready.
4. Test the Vercel preview build.
5. Test the Expo preview build.

## Before Production

1. Complete Supabase auth and database integration.
2. Complete mobile Supabase integration.
3. Complete real push notification setup.
4. Enable tested backup and restore process.
5. Run route smoke tests and manual critical workflow checks.
6. Review security and permission matrix with real data.

## Commands To Keep Running

Run before every handoff:

```bash
npm run check:lines
npm run typecheck
npm run build
```

Run before every publish:

```bash
npm run audit
npm run lint
npm run test
```

## Current Recommendation

Keep the project in mock/demo mode until auth mode, repository data access, mobile backend mode, and route smoke tests are tightened.
