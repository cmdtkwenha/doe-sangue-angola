# Mobile Build Guide

This guide explains how to prepare the Doe Sangue Angola donor mobile app using Expo.

## What The Mobile App Is

The mobile app is the donor experience. Donors can:

- See blood requests nearby.
- Accept or decline requests.
- View donor card and QR placeholder.
- Track rewards and donation progress.
- Receive notifications.
- Manage privacy and emergency contacts.

## Before Building

Install dependencies:

```bash
npm install
```

Run checks:

```bash
npm run check:lines
npm run test
npm run typecheck
```

## Run Mobile Locally

Start Expo:

```bash
npm run dev:mobile
```

Expo will show options for testing in:

- Expo Go.
- Android emulator.
- iOS simulator.
- Browser preview.

## EAS Build Setup

Expo Application Services, called EAS, creates installable app builds.

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Log In

```bash
eas login
```

### Step 3: Enter Mobile App Folder

```bash
cd apps/mobile
```

### Step 4: Connect Expo Project

```bash
eas init
```

After this, Expo may provide a project ID. Add it to `apps/mobile/app.json` if needed.

## Preview Build

Use preview builds for founders, hospitals, testers, and stakeholders.

Android preview:

```bash
eas build --profile preview --platform android
```

iOS preview:

```bash
eas build --profile preview --platform ios
```

All platforms:

```bash
eas build --profile preview --platform all
```

## Production Build

Use production builds only when the pilot is approved.

```bash
eas build --profile production --platform all
```

## Mobile Environment Variables

Keep mock mode for demos:

```bash
EXPO_PUBLIC_DATA_MODE=mock
EXPO_PUBLIC_PILOT_MODE=false
EXPO_PUBLIC_PILOT_SAFE_NOTIFICATIONS=true
```

When Supabase is approved:

```bash
EXPO_PUBLIC_DATA_MODE=supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Push Notifications

The architecture is prepared for Expo Push Notifications.

Before sending real push notifications:

1. Confirm donor consent.
2. Confirm notification preferences.
3. Test with safe pilot accounts.
4. Avoid sending sensitive patient details.
5. Keep emergency messages short and clear.

## Store Readiness Checklist

Before App Store or Play Store submission:

1. Replace placeholder app icons.
2. Replace placeholder splash screen.
3. Add privacy policy URL.
4. Add support email.
5. Add screenshots.
6. Add medical disclaimer text.
7. Confirm notification consent flow.
8. Confirm account deletion placeholder is ready.
9. Test on real Android device.
10. Test on real iPhone if iOS launch is planned.

## Demo Checklist

1. Install preview build or open Expo Go.
2. Log in as donor.
3. Show home screen.
4. Open available requests.
5. Accept an urgent request.
6. Show generated appointment and PIN.
7. Show rewards and share message.

## Founder Note

Use preview builds for presentations. Use production builds only when the product is ready for a real pilot.
