# Mobile Release

The donor app lives in `apps/mobile` and uses Expo. It is prepared for Expo
Application Services, also called EAS.

## Demo Build

Use a preview build when sharing with a small group:

```bash
cd apps/mobile
npx eas build --profile preview --platform android
```

For iPhone testing:

```bash
cd apps/mobile
npx eas build --profile preview --platform ios
```

## Production Build

Before app store submission:

```bash
cd apps/mobile
npx eas build --profile production --platform all
```

## Required App Store Items

- App name: Doe Sangue Angola
- Support contact
- Privacy policy
- Screenshots from a real phone size
- Clear note that medical decisions are handled by verified hospitals

## Environment

Keep mock mode for demos:

```bash
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_DATA_MODE=mock
```

Use Supabase only after real authentication, privacy review, and hospital
approval workflows are complete.
