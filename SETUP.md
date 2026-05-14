# Setup

This guide explains how to run Doe Sangue Angola locally.

## Requirements

- Node.js 20 or newer.
- npm.
- Expo tooling for mobile development.

## Install

```bash
npm install
```

## Environment

Create a local environment file:

```bash
cp .env.example .env.local
```

For MVP demos, keep:

```bash
NEXT_PUBLIC_DATA_MODE=mock
```

## Run Web

```bash
npm run dev:web
```

Open:

- `http://localhost:3000/auth`
- `http://localhost:3000/admin`
- `http://localhost:3000/hospital`
- `http://localhost:3000/mobile`

## Run Mobile

```bash
npm run dev:mobile
```

Expo will show options for simulator, device or web.

## Verify

Run:

```bash
npm run check:lines
npm run audit
npm run test
npm run typecheck
```

## Common Issues

### Port 3000 Is Busy

Stop the old process or run Next.js on another port from the web workspace.

### Supabase Is Not Configured

This is expected for MVP demos. The app remains usable in mock mode.

### Mobile Push Does Not Send Real Notifications

Real push setup is prepared but not enabled by default. The MVP uses demo notification flows.
