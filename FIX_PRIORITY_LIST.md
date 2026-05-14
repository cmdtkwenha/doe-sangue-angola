# Fix Priority List

This list is based on inspection only. It avoids new feature work and focuses on stability, maintainability, and production readiness.

## P0: Fix Before Real Production

### 1. Separate demo auth from Supabase auth warnings

Current state:

- Demo accounts exist and can be used when Supabase is not configured.
- The auth provider also sets a Supabase configuration warning when Supabase env vars are missing.

Risk:

- Founder demos may show confusing auth copy.
- Production auth expectations are not fully clear.

Recommended fix:

- Add one explicit auth mode flag such as `NEXT_PUBLIC_AUTH_MODE=demo | supabase`.
- In demo mode, do not show Supabase configuration errors.
- In Supabase mode, disable demo fallback unless explicitly allowed.

### 2. Align mobile production data mode

Current state:

- `apps/mobile/eas.json` production profile sets `EXPO_PUBLIC_DATA_MODE=supabase`.
- Mobile Supabase client is still intentionally placeholder-level.

Risk:

- A production mobile build could expect real backend behavior before it is ready.

Recommended fix:

- Keep production EAS data mode as `mock` until Supabase mobile reads/writes are complete.
- Or complete Supabase mobile integration before using that profile.

### 3. Replace direct mock reads with repositories

Current state:

- Several services import `mockData.ts` directly.

Risk:

- Switching to Supabase will be uneven.
- UI and services may read different sources.

Recommended fix:

- Route all reads/writes through repository interfaces.
- Keep `mockProvider` only as the demo implementation.

## P1: Fix Before Pilot

### 4. Add route smoke tests

Current state:

- Routes compile in `next build`.
- Runtime browser navigation was not tested in this pass.

Risk:

- A route can compile but still have runtime auth or hydration issues.

Recommended fix:

- Add lightweight smoke tests for `/auth`, `/admin`, `/hospital`, `/mobile`, and key management routes.

### 5. Verify critical workflow in browser

Current state:

- Unit/workflow tests pass.
- Manual browser verification was not part of this pass.

Risk:

- A connected flow may pass in service tests but fail in UI state.

Recommended fix:

- Test login, request creation, donor acceptance, PIN validation, completion, rewards, notifications, and audit logs in the web UI.

### 6. Clean placeholder directories

Current state:

- Empty folders exist under legacy component/assets paths.

Risk:

- Contributors may add files in the wrong place.

Recommended fix:

- Either remove empty placeholders or add README files explaining their purpose.

## P2: Improve Maintainability

### 7. Reduce exported mock internals

Current state:

- `mockData` and `mockProvider` are exported from shared services.

Risk:

- New code may import mock data directly.

Recommended fix:

- Stop exporting raw mock data from the public package surface once repositories cover all flows.

### 8. Add dependency and route audit script

Current state:

- Manual inspection was used for this report.

Risk:

- Future regressions may be missed.

Recommended fix:

- Add an automated audit for route files, empty source directories, and direct `mockData` imports.

### 9. Clarify production readiness in docs

Current state:

- Docs mention mock-first and Supabase readiness in several places.

Risk:

- Non-technical stakeholders may assume production backend is live.

Recommended fix:

- Add a short "Production backend not live yet" note near the top of README and deployment docs.
