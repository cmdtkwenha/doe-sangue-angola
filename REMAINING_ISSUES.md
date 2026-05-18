# Remaining Issues

No blocking build issues were found.

## Priority 1

### Verify Supabase in a real project

The code is prepared for Supabase, but this audit did not connect to a live
Supabase project. Before public launch, verify:

- Auth users can log in.
- Roles redirect correctly.
- Hospital creates a real request row.
- Donor acceptance creates an appointment.
- PIN validation updates appointment and request status.
- Completion persists reward points.
- Notifications and audit logs are stored.

### Review RLS policies

RLS must be reviewed with production accounts:

- Admin can read national data.
- Hospital can read only its own operational data.
- Donor can read only its own profile, notifications and appointments.
- Service-role operations stay server-only.

## Priority 2

### Run a real Android EAS build

Local Expo config passes, but a cloud Android build still needs a real EAS run:

```bash
cd apps/mobile
npx eas build --profile preview --platform android
```

Then test on a physical Android phone.

### Test real push delivery

Push failures are now safe, but real delivery must be verified with:

- Development build or production build.
- Physical device.
- Expo push token registration.
- Request-triggered notification.

## Priority 3

### Clean ignored local files

These local files are ignored and will not be committed:

- `.DS_Store`
- `apps/mobile/app.json.backup`
- `apps/mobile/app.json.save`

They can be removed manually before packaging a zip, but they do not affect
GitHub publishing.

### Check final store assets

Before app store submission, prepare:

- App icon.
- Splash screen.
- Screenshots.
- Privacy policy URL.
- Support contact.

## Non-Issues

- Duplicate filenames such as `page.tsx`, `route.ts`, `index.ts` and
  `package.json` are expected framework/workspace conventions.
- English text in technical documentation is acceptable. User-facing app copy
  remains Portuguese-first.
- Mock mode remains intentionally available as rollback and demo mode.
