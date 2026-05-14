# Project Status

Date: 2026-05-13

Scope: production-readiness only. No product features were added.

## Verification

| Check | Result |
| --- | --- |
| `npm run check:lines` | Passed |
| `npm run test` | Passed |
| `npm run smoke` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm ls --workspace apps/mobile --depth=0` | Passed |

## Production-Readiness Work Completed

### 1. Authentication Consistency

- Auth mode is explicit: `demo` or `supabase`.
- Demo mode is the default in all env examples.
- Demo mode no longer shows Supabase configuration warnings.
- Supabase mode still requires public Supabase keys.
- Login copy now describes environment-controlled auth.

Main files:

- `packages/shared-services/src/config.ts`
- `packages/shared-services/src/env/environment.ts`
- `packages/shared-services/src/env/validateEnv.ts`
- `apps/web/app/components/auth/AuthProvider.tsx`

### 2. Supabase Repository Coverage

- Repository registry cleanly separates mock and Supabase implementations.
- `mockRepositories` is now the only module allowed to directly depend on mock storage for repository behavior.
- `mockProvider` delegates through repositories.
- Supabase request repository supports:
  - list requests
  - list hospital requests
  - create request
  - accept request
  - validate PIN
  - complete request
- Supabase donor repository handles reward point updates.
- Supabase notification repository handles donor notifications.
- Supabase audit repository handles audit log creation.

Main files:

- `packages/shared-services/src/repositories/mockRepositories.ts`
- `packages/shared-services/src/repositories/requestRepository.ts`
- `packages/shared-services/src/repositories/donorRepository.ts`
- `packages/shared-services/src/repositories/notificationRepository.ts`
- `packages/shared-services/src/repositories/auditRepository.ts`
- `packages/shared-services/src/supabaseProvider.ts`

### 3. Direct Mock Data Usage Reduced

- Direct `mockData.ts` imports were centralized behind `mockStore.ts`.
- Project source now references `mockData.ts` only from `mockStore.ts`.
- Existing synchronous demo services remain operational through `mockStore`.

Remaining production note:

- Synchronous UI/demo services still use mock-backed helpers through `mockStore`.
- Migrating those components fully to Supabase requires async UI states.

### 4. Shared Live Data Path

- Web and mobile can now share the same Supabase backend configuration.
- Web uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Mobile uses `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Mobile Supabase client factory now creates a real Supabase client when configured.
- Mobile package now declares `@supabase/supabase-js`.

Main files:

- `apps/mobile/lib/supabaseClient.ts`
- `apps/mobile/package.json`
- `package-lock.json`

### 5. Push Notification Readiness

- Push mode is explicit: `mock` or `expo`.
- Mock push is the default to prevent accidental real sends.
- Expo push sender dry-runs unless `PUSH_MODE=expo`.
- Push token and notification preference storage remains Supabase-ready.

Main files:

- `packages/shared-services/src/config.ts`
- `packages/shared-services/src/pushService.ts`
- `supabase/migrations/002_push_notifications.sql`

### 6. Smoke Testing

- Added `npm run smoke`.
- Smoke check verifies web route entry files and mobile entry/config files.
- This is a structural smoke test, not full browser/device automation.

Main files:

- `scripts/smoke-routes.cjs`
- `package.json`

## Critical Flow Coverage

Service-level test still verifies:

1. Hospital creates request.
2. Admin/shared request state sees request.
3. Donor receives notification.
4. Donor accepts request.
5. PIN is generated.
6. Hospital validates PIN.
7. Request is completed.
8. Rewards are updated.
9. Notifications are sent.
10. Audit logs are created.

Status: covered in mock service tests.

Production gap: the same flow still needs browser/device automation in Supabase mode.

## Remaining Blockers Before Production

1. Convert synchronous demo UI workflow components to async repository-backed calls.
2. Run Supabase mode against a real Supabase project with RLS enabled.
3. Test role-based Supabase auth with admin, hospital, and donor users.
4. Verify mobile Expo app against the same Supabase project as web.
5. Enable `PUSH_MODE=expo` only after push token consent and delivery tests.
6. Add browser/device smoke tests for the full critical workflow.
7. Keep mock/demo mode available for investor demos and rollback.

## Current Verdict

Build status: green.

Demo mode: stable.

Staging readiness: improved.

Production-live readiness: closer, but not complete until async UI flows and Supabase runtime testing are finished.
