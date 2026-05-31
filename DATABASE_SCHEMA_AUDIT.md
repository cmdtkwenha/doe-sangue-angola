# Database Schema Audit

Date: 2026-05-31

## Scope

The audit scanned runtime Supabase access patterns in:

- `apps/web/app/api`
- `apps/web/app/components`
- `packages/shared-services/src/repositories`
- `packages/shared-services/src/pushService.ts`
- `scripts/import-hospitals.ts`

It covered `.from(...)`, `.select(...)`, `.insert(...)`, `.update(...)` and `.upsert(...)`
calls used by Admin, Hospital and Donor workflows.

## Existing Schema

The project already had migrations for the core platform:

- `users`
- `profiles`
- `donors`
- `hospitals`
- `blood_requests`
- `appointments`
- `notifications`
- `rewards`
- `audit_logs`
- `fraud_reviews`
- `donor_responses`
- `hospital_inventory`
- healthcare import tables
- support and legal consent tables

## Missing Schema Found

The current runtime error came from the PIN workflow:

- `donor_responses.pin_expires_at`

The wider audit also confirmed runtime dependence on these `donor_responses`
operational columns:

- `accepted_at`
- `arrived_at`
- `pin_validated_at`
- `cancelled_at`
- `completed_at`
- `donation_completed_at`
- `pin_locked_until`
- `failed_pin_attempts`
- `reward_accepted_at`
- `reward_arrived_at`
- `reward_completed_at`

These are now part of the application schema contract.

## Added Migrations

- `039_donor_schema_contract.sql`
- `040_legal_consents_contract.sql`
- `041_application_schema_contract.sql`

The new application contract migration creates or repairs missing runtime tables,
columns and indexes with production-safe `IF NOT EXISTS` statements.

## Verification Script

Added:

```bash
npm run schema:verify
```

Behavior:

- Without Supabase environment variables, it verifies that migrations contain
  the required table and column contract.
- With Supabase URL and key configured, it queries Supabase with zero-row selects
  to verify that required tables and columns exist remotely.

## Critical Workflows Covered

The schema contract covers:

- donor onboarding
- donor profile editing
- donor request acceptance
- PIN generation
- PIN validation
- hospital request creation
- hospital accepted donor management
- notification creation and read states
- rewards and audit logs

## Graceful Failure

API responses now convert schema cache/table/column errors into:

> Configuração da base de dados incompleta. Execute as migrations e volte a tentar.

This prevents raw Supabase schema errors from surfacing directly to users.

## Remaining Issues

- Apply all migrations to the remote Supabase project before pilot testing.
- Run `npm run schema:verify` with production Supabase env vars after deployment.
- The static audit cannot prove remote RLS behavior; test role-based workflows
  manually after applying migrations.
