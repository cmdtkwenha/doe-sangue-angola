# Final Full-System Audit

Date: 2026-05-17

## Commands Run

```bash
npm run check:lines
npm run typecheck
npm run build
npm run audit
npm run smoke
npm run test
npm run lint
npm --workspace apps/mobile exec -- expo config --type public
```

## Result

All required checks passed.

## Audit Findings

| Area | Status | Notes |
| --- | --- | --- |
| Broken imports | Pass | `npm run typecheck` and `npm run build` completed successfully. |
| Broken routes | Pass | Next build lists all web/API routes; smoke route check passed. |
| Missing translations | Pass with notes | Product UI remains Portuguese-first. Technical docs use English where appropriate. |
| Loading states | Pass | Web has global loading plus dashboard skeletons; mobile has startup loading state. |
| Empty states | Pass | Shared web and native empty-state components exist and are used in key flows. |
| Error handling | Pass | Web has global error boundaries/API responses; mobile has startup, push and offline guards. |
| Oversized files | Pass | `npm run check:lines` passed; all files stay under 250 lines. |
| Unused files | Needs cleanup note | Ignored local files exist: `.DS_Store`, `apps/mobile/app.json.backup`, `apps/mobile/app.json.save`. |
| Unused dependencies | Pass with notes | Declared dependencies are referenced by app code or build config. |
| Duplicate components | Pass with notes | No conflicting duplicate components found; repeated names are framework conventions. |

## Route Inventory

Confirmed by build:

- `/`
- `/auth`
- `/auth/register`
- `/auth/forgot-password`
- `/admin`
- `/admin/audit`
- `/admin/donors`
- `/admin/fraud`
- `/admin/hospitals`
- `/admin/notifications`
- `/admin/reports`
- `/admin/requests`
- `/admin/settings`
- `/hospital`
- `/hospital/reports`
- `/hospital/settings`
- `/mobile`
- `/mobile/settings`
- `/onboarding/admin`
- `/onboarding/donor`
- `/onboarding/hospital`
- `/unauthorized`

Confirmed API routes:

- `/api/health`
- `/api/blood-requests`
- `/api/blood-requests/status`
- `/api/appointments/accept`
- `/api/appointments/complete`
- `/api/appointments/validate-pin`
- `/api/notifications`
- `/api/push/register`
- `/api/push/send`

## Dependency Notes

The dependency audit checked the declared runtime stack:

- Next.js, React and React DOM are used by the web app.
- Expo, React Native and Expo native modules are used by the mobile app.
- Supabase packages are used by auth/client/repository setup.
- Tailwind, PostCSS and Autoprefixer remain part of the web styling/build setup.

No dependency was removed during this audit.

## Repository Cleanliness

`git status --short` shows intended uncommitted changes from the production
integration, mobile stabilization and deployment documentation work.

Ignored local cleanup candidates:

- `.DS_Store`
- `apps/mobile/app.json.backup`
- `apps/mobile/app.json.save`

They are ignored by `.gitignore` and will not be published to GitHub.
