# Doe Sangue Angola

Doe Sangue Angola is a Portuguese-first Launch Candidate for a connected blood donation platform in Angola. It links national administrators, hospitals/clinics and blood donors through one shared TypeScript platform.

The current version is stable, deployable and investor-demo ready. It uses mock data by default, while keeping the architecture prepared for Supabase, realtime updates and push notifications.

## Features

- National Admin Portal for KPIs, requests, shortages, hospitals, fraud review, reports and audit logs.
- Hospital/Clinic Portal for urgent requests, incoming donors, PIN validation, inventory, appointments, reports and settings.
- Donor Mobile App experience for requests, donor card, eligibility, rewards, notifications, privacy and emergency contacts.
- Role onboarding for Admin, Hospital and Donor users.
- Role-based authentication architecture.
- Shared mock services used by web and mobile.
- Supabase schema, seed data and provider structure prepared for backend launch.
- CSV reports and professional release documentation.

## Tech Stack

- Next.js and React for the web platform.
- Expo React Native for the donor mobile app.
- TypeScript across apps and packages.
- Supabase-ready authentication and database layer.
- Shared services, shared types and business agents in a monorepo.
- CSS Modules and design tokens for premium UI polish.

## Folder Structure

- `apps/web`: Admin, Hospital and Mobile preview routes.
- `apps/mobile`: Expo donor app.
- `packages/shared-types`: common TypeScript models.
- `packages/shared-services`: mock data, repositories, realtime, notifications and Supabase adapters.
- `packages/agents`: matching, eligibility, scheduling, reward, fraud and audit logic.
- `supabase`: migrations, schema notes and seed data.
- `docs`: setup, deployment, testing, architecture and release notes.
- `scripts`: local checks for lines, audit and tests.

## How The Platform Connects

1. A hospital creates a blood request.
2. Shared services store it in the mock data layer.
3. `matchingAgent` finds compatible donors.
4. Donors receive in-app notification data.
5. A donor accepts the request.
6. `schedulingAgent` creates a 4-digit PIN.
7. The hospital validates the PIN.
8. Admin dashboards and reports reflect the updated status.
9. `auditAgent` and `rewardAgent` record the action and donor progress.

More detail is available in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Setup

Install dependencies:

```bash
npm install
```

Run the web platform:

```bash
npm run dev:web
```

Run the mobile app:

```bash
npm run dev:mobile
```

Open the web app at `http://localhost:3000`.

## Founder Handoff

The final founder handoff package is in `docs`:

- [Founder guide](./docs/founder-guide.md)
- [How the platform works](./docs/how-the-platform-works.md)
- [Local development](./docs/local-development.md)
- [Deployment walkthrough](./docs/deployment-walkthrough.md)
- [Mobile build guide](./docs/mobile-build-guide.md)

## Main Routes

- `/auth`: login
- `/admin`: national admin dashboard
- `/hospital`: hospital/clinic dashboard
- `/mobile`: donor mobile app preview
- `/admin/reports`: admin reports
- `/hospital/reports`: hospital reports
- `/onboarding/admin`: admin onboarding
- `/onboarding/hospital`: hospital onboarding
- `/onboarding/donor`: donor onboarding

## Investor Demo

Use these mock accounts for stakeholder presentations:

| Perfil | Email | Senha |
| --- | --- | --- |
| Admin Nacional | `admin@sangueangola.ao` | `demo@2026` |
| Hospital Verificado | `hospital@sangueangola.ao` | `demo@2026` |
| Dador Mobile | `donor@sangueangola.ao` | `demo@2026` |

Também pode usar a senha antiga `Demo@2026`. Para Vercel em modo demo,
configure `NEXT_PUBLIC_AUTH_MODE=mock`. Guia rápido:
[docs/demo-login.md](./docs/demo-login.md).

Open `/admin` after login and use Presentation Mode to launch a guided flow: hospital request, admin live update, donor acceptance, PIN validation, completion, rewards and audit logs.

## Quality Checks

Run before publishing or committing:

```bash
npm run check:lines
npm run audit
npm run lint
npm run test
npm run typecheck
npm run build
```

Every source file must remain under 250 lines.

## Environment

Use the example that matches the target environment:

- `.env.development.example`: local work
- `.env.staging.example`: private testing
- `.env.production.example`: public launch

Copy one of them to `.env.local` for local work. Mock mode is the default:

```bash
NEXT_PUBLIC_DATA_MODE=mock
```

See [ENVIRONMENT.md](./ENVIRONMENT.md) and [env/README.md](./env/README.md) for all variables.

## Deployment

- Deployment overview: [docs/deployment.md](./docs/deployment.md)
- Web on Vercel: [docs/vercel-deploy.md](./docs/vercel-deploy.md)
- Supabase production: [docs/supabase-production.md](./docs/supabase-production.md)
- Mobile builds: [docs/mobile-build.md](./docs/mobile-build.md)
- Production checklist: [docs/production-checklist.md](./docs/production-checklist.md)

Production uses `NEXT_PUBLIC_AUTH_MODE=supabase`,
`NEXT_PUBLIC_DATA_MODE=supabase` and `NEXT_PUBLIC_PUSH_MODE=expo` after the
Supabase security review is complete. Mock mode remains the safe rollback path.

For Vercel, use:

```bash
npm install
npm run build:web
```

For Expo Android builds, use:

```bash
cd apps/mobile
eas build --profile development --platform android
```

Before release, run:

```bash
npm run check:lines
npm run test
npm run smoke
npm run lint
npm run typecheck
npm run build
```

## Screenshots

Screenshot asset guidance lives in [docs/screenshots](./docs/screenshots). Add final images before public launch:

- Admin dashboard
- Hospital dashboard
- Donor mobile app

## Status

Launch Candidate locked for first launch review. Ready to publish to GitHub as the professional baseline.
