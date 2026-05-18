# Mobile Release

The donor app lives in `apps/mobile` and is built with Expo EAS.

Use Expo Go only for simple UI checks. Real push notifications require a
development build or production build.

## EAS Profiles

The file `apps/mobile/eas.json` defines:

| Profile | Use |
| --- | --- |
| `development` | Internal development build with native push modules. |
| `preview` | APK for stakeholder testing. |
| `production` | Android App Bundle and iOS production build. |

## Development Build

```bash
cd apps/mobile
npx eas build --profile development --platform android
```

Install the APK on a physical Android phone. Then run:

```bash
npm run dev:mobile
```

Choose the development build in Expo CLI.

## Preview Build

Use preview for founder demos and private stakeholder review:

```bash
cd apps/mobile
npx eas build --profile preview --platform android
```

Preview defaults to mock data and mock push for safe demos.

## Production Build

Before production, confirm Supabase and Vercel are live.

```bash
cd apps/mobile
npx eas build --profile production --platform android
```

For iOS:

```bash
cd apps/mobile
npx eas build --profile production --platform ios
```

## Production Variables

Set these in EAS project variables:

```bash
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_AUTH_MODE=supabase
EXPO_PUBLIC_DATA_MODE=supabase
EXPO_PUBLIC_PUSH_MODE=expo
EXPO_PUBLIC_API_URL=https://doesangue.ao
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_EAS_PROJECT_ID=
```

Do not add `SUPABASE_SERVICE_ROLE_KEY` to Expo.

## Android Checks

- Package name is `ao.doesangue.app`.
- `POST_NOTIFICATIONS` permission is configured.
- `expo-notifications` plugin is configured.
- Push registration fails safely if permission is denied.
- Offline banner appears if the API is unavailable.

## Release Checklist

- App opens without Expo Go.
- Home screen loads with loading and error recovery.
- Push token registration works in development build.
- Push token failure does not crash the app.
- Donor requests render on Android.
- Notification preferences can be toggled.
- `npm --workspace apps/mobile exec -- tsc --noEmit` passes.
- `npx eas build --profile preview --platform android` completes.

## Store Materials

Prepare these before public submission:

- App icon.
- Splash screen.
- Privacy policy URL.
- Support contact.
- Screenshots from a real phone.
- Short description in Portuguese.
- Medical disclaimer approved by the founder.
