# Mobile Development Build

Use a development build when you need real Expo Push Notifications on a phone.

Expo Go stays supported, but it uses simulated in-app notifications. This is intentional because Android remote push notifications are not supported in Expo Go with `expo-notifications`.

## What Works In Each Mode

| Mode | Push token | Notifications |
| --- | --- | --- |
| Expo Go | No real token | Mock/in-app notifications |
| Development build | Real Expo token | Real Expo push ready |
| Preview/production | Mock by default | Enable real push after testing |

## Files Configured

- `apps/mobile/eas.json`
- `apps/mobile/app.json`
- `apps/mobile/app.config.ts`
- `apps/mobile/app/hooks/usePushNotifications.ts`
- `apps/mobile/app/hooks/pushNotificationsSetup.ts`

## Required Environment

For a development build, set:

```bash
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_AUTH_MODE=demo
EXPO_PUBLIC_DATA_MODE=mock
EXPO_PUBLIC_PUSH_MODE=expo
EXPO_PUBLIC_API_URL=https://your-web-api-url
EXPO_PUBLIC_EAS_PROJECT_ID=your-eas-project-id
```

`EXPO_PUBLIC_API_URL` must point to the web app that exposes:

```text
/api/push/register
/api/push/send
```

## Build Android Development App

From the repository root:

```bash
cd apps/mobile
eas build --profile development --platform android
```

Install the APK on a physical Android device.

## Build iOS Simulator App

```bash
cd apps/mobile
eas build --profile development --platform ios
```

The current development profile targets the simulator. Change `ios.simulator` to `false` for a real iPhone build.

## Run The Development Build

After installing the dev build:

```bash
npm run dev:mobile
```

Open the installed development build and connect it to Metro.

## Expo Go Behavior

In Expo Go, the app shows:

```text
Notificações push reais precisam de uma development build. No Expo Go, usamos notificações simuladas.
```

The notification UI still works, but no real token registration is attempted.

## Real Push Checklist

1. Create or link the Expo project with `eas init`.
2. Set `EXPO_PUBLIC_EAS_PROJECT_ID`.
3. Set `EXPO_PUBLIC_PUSH_MODE=expo`.
4. Set a reachable `EXPO_PUBLIC_API_URL`.
5. Install the development build on a physical device.
6. Tap "Ativar notificações".
7. Confirm the token appears in Supabase `push_tokens`.
8. Create a hospital blood request and confirm compatible donors receive push notifications.
