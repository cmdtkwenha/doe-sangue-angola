# Local Development Guide

This guide explains how to run Doe Sangue Angola on a local computer.

## What You Need

Install these first:

- Node.js 22 or newer.
- npm.
- A code editor such as VS Code.
- Git.

For mobile builds later, you also need Expo tools. See `docs/mobile-build-guide.md`.

## Step 1: Open The Project

Open a terminal in the project folder:

```bash
cd /Users/test/Desktop/Doe-Sangue-Angola
```

## Step 2: Install Dependencies

Run:

```bash
npm install
```

This downloads the packages used by the web app, mobile app, and shared code.

## Step 3: Create Local Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

Keep mock mode enabled for normal local demos:

```bash
NEXT_PUBLIC_DATA_MODE=mock
EXPO_PUBLIC_DATA_MODE=mock
```

Do not put private production keys in GitHub.

## Step 4: Run The Web Platform

Run:

```bash
npm run dev:web
```

Open:

```text
http://localhost:3000
```

Main pages:

- `/auth`
- `/admin`
- `/hospital`
- `/mobile`

## Step 5: Run The Mobile App

In another terminal, run:

```bash
npm run dev:mobile
```

Expo will show options for opening the app in a simulator, browser, or Expo Go.

## Demo Logins

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@sangueangola.ao` | `Demo@2026` |
| Hospital | `hospital@sangueangola.ao` | `Demo@2026` |
| Donor | `donor@sangueangola.ao` | `Demo@2026` |

## Quality Checks

Run these before sharing the project:

```bash
npm run check:lines
npm run audit
npm run lint
npm run test
npm run typecheck
```

The line check matters because every file must stay under 250 lines.

## If Port 3000 Is Busy

If another app is already using port 3000, Next.js may offer another port such as 3001.

You can also stop the old server by closing the terminal where it is running.

## Common Problems

### Dependencies fail to install

Try:

```bash
npm install
```

If it still fails, check your Node.js version.

### Web app does not open

Make sure `npm run dev:web` is still running.

### Login does not redirect

Confirm the app is in mock mode:

```bash
NEXT_PUBLIC_DATA_MODE=mock
```

### Mobile app does not start

Run:

```bash
npm run dev:mobile
```

Then follow the Expo instructions shown in the terminal.

## Safe Local Demo Routine

1. Start the web app.
2. Open `/auth`.
3. Log in as Admin.
4. Show `/admin`.
5. Log in as Hospital.
6. Show `/hospital`.
7. Open `/mobile`.
8. Walk through request, acceptance, PIN, completion, rewards.
