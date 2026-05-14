# Architecture

Doe Sangue Angola is a monorepo with shared logic across web and mobile.

## High-Level Structure

- `apps/web`: Next.js application for Admin, Hospital and Mobile preview.
- `apps/mobile`: Expo React Native donor application.
- `packages/shared-types`: TypeScript models shared by every app.
- `packages/shared-services`: data providers, mock data, repositories, realtime, notifications and Supabase adapters.
- `packages/agents`: business logic agents.
- `supabase`: database schema, migrations and seed data.
- `docs`: operational and founder-friendly documentation.

## Core Principle

Admin, Hospital and Mobile should not each invent their own data. They read and write through shared services, so a request created by a hospital can appear in admin monitoring and donor flows.

## Request Flow

1. Hospital creates a request.
2. `requestService` saves it through the active data provider.
3. `eventBus` and `realtimeService` broadcast mock realtime updates.
4. `matchingAgent` scores compatible donors.
5. `notificationService` creates donor notifications.
6. Donor accepts or rejects the request.
7. `appointmentService` creates the appointment and PIN.
8. Hospital validates the PIN.
9. `auditService` records the action.
10. `rewardAgent` updates donor points after completion.

## Data Layer

The project supports two modes:

- `mock`: default mode for demos and local development.
- `supabase`: prepared mode for later backend activation.

The switch is controlled by `NEXT_PUBLIC_DATA_MODE`.

## Agents

- `matchingAgent`: donor compatibility and prioritization.
- `eligibilityAgent`: donor safety checks.
- `schedulingAgent`: appointment and PIN generation.
- `rewardAgent`: points, badges and progress.
- `fraudAgent`: suspicious activity scoring.
- `auditAgent`: audit event structure.
- `reminderAgent`: reminder recommendations.

## UI Architecture

- Pages should only compose components.
- Large UI sections are split into small files.
- Shared UI states live under `apps/web/app/components/ui`.
- Accessibility helpers live under `apps/web/app/components/accessibility`.
- Role-specific screens live in Admin, Hospital, Mobile, Reports, Settings and Onboarding component folders.

## Backend Readiness

Supabase files are present, but production activation should wait for:

- Row Level Security review.
- Auth role mapping review.
- Production environment variable setup.
- Seed data validation.
- Private key handling review.
