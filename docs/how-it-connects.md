# How Admin, Hospital And Mobile Connect

Doe Sangue Angola is one connected product with three experiences.

## Shared Core

- `packages/shared-types` defines the contracts for donors, hospitals, requests, appointments and audit logs.
- `packages/shared-services` owns mock data, data providers, repositories, notifications, realtime events and Supabase-ready adapters.
- `packages/agents` owns business logic such as matching, scheduling, eligibility, fraud scoring and rewards.

The web and mobile apps both use these shared packages, so the demo flow stays consistent across portals.

## MVP Request Flow

1. A hospital creates an urgent request in the Hospital Portal.
2. `requestService` stores the request in the shared mock data layer.
3. `realtimeService` emits a request event.
4. Admin live panels read the same shared request state.
5. `matchingAgent` identifies compatible donors.
6. `notificationService` creates donor-facing notifications.
7. The donor app shows the request.
8. When the donor accepts, `appointmentService` creates an appointment and PIN.
9. The hospital sees the incoming donor and validates the PIN.
10. `auditService` records each important action.
11. `rewardAgent` updates donor progress after completion.

## Role Experiences

### Admin

The Admin Portal monitors national demand, hospital verification, fraud review, inventory, reports and audit logs.

### Hospital/Clinic

The Hospital Portal manages requests, incoming donors, PIN validation, inventory, appointments, reports and clinical settings.

### Donor

The Mobile App manages requests, donor card, eligibility, rewards, notifications, privacy and emergency contacts.

## Backend Readiness

The MVP runs in mock mode by default. Supabase tables, seed data, repositories and environment examples are already prepared. Switch to Supabase only after production security review.
