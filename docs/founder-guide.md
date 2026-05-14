# Founder Guide

This guide explains Doe Sangue Angola in simple terms. It is written for a founder, operator, or stakeholder who needs to understand, demo, and manage the product without reading code.

## What Doe Sangue Angola Does

Doe Sangue Angola connects three groups:

1. National administrators who monitor blood shortages across Angola.
2. Hospitals and clinics that request blood when patients need it.
3. Donors who receive nearby requests and accept appointments.

The first launch version uses safe mock data. This means you can demo the full system without connecting to a real hospital database yet.

## The Three Experiences

### Admin Portal

Route: `/admin`

The Admin Portal is the national command center. It shows:

- Live blood requests.
- Shortage alerts by province.
- Hospital verification.
- Fraud review.
- Donor and hospital activity.
- Audit logs and system health.

### Hospital Portal

Route: `/hospital`

The Hospital Portal is for verified hospitals and clinics. It helps staff:

- Create urgent blood requests.
- See incoming donors.
- Validate donor PIN codes.
- Track appointments.
- Manage blood inventory.
- Review audit history.

### Donor Mobile App

Route: `/mobile`

The mobile app experience is for donors. It lets donors:

- See available blood requests.
- Accept or decline a request.
- View their digital donor card.
- Track rewards and points.
- Receive notifications.
- Share after donating.

## Demo Accounts

Use these accounts for demos and stakeholder meetings:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@sangueangola.ao` | `Demo@2026` |
| Hospital | `hospital@sangueangola.ao` | `Demo@2026` |
| Donor | `donor@sangueangola.ao` | `Demo@2026` |

## Demo Story

Use this story when presenting the product:

1. Log in as Admin and show the national dashboard.
2. Explain that the map shows blood shortages by province.
3. Switch to the Hospital Portal.
4. Create or show an urgent O- request.
5. Explain that compatible donors are matched automatically.
6. Switch to the mobile donor view.
7. Show the donor receiving and accepting the request.
8. Return to the Hospital Portal.
9. Show the incoming donor and 4-digit PIN validation.
10. Mark the donation complete.
11. Return to Admin and show the updated request status and audit trail.
12. Show donor rewards and social sharing.

## What Is Real Today

The product currently has:

- Working screens for Admin, Hospital, and Mobile.
- Shared mock data across the platform.
- Mock authentication and role redirects.
- Mock realtime updates.
- Mock notifications.
- Supabase-ready database structure.
- Deployment and release documentation.

## What Is Not Live Yet

These parts are prepared but should not be treated as live production services yet:

- Real hospital integrations.
- Real donor identity verification.
- Real push notification delivery.
- Real payment or billing features.
- Real medical records.
- Live Supabase production database.

## Pilot Safety Rules

For a small pilot, follow these rules:

1. Use only approved test hospitals.
2. Use only volunteer test donor accounts.
3. Do not enter private patient information.
4. Use Luanda and Benguela as the first pilot provinces.
5. Keep notifications in safe test mode until approved.
6. Review all hospital accounts before enabling them.

## Founder Checklist Before A Demo

1. Confirm the app starts locally.
2. Confirm `/auth`, `/admin`, `/hospital`, and `/mobile` open.
3. Log in with all three demo accounts.
4. Open Presentation Mode.
5. Reset demo data before the meeting.
6. Keep the mockup images nearby as visual reference.
7. Prepare the story: urgent request, donor match, PIN validation, reward.

## Where To Find More

- Local setup: `docs/local-development.md`
- How the apps connect: `docs/how-the-platform-works.md`
- Web deployment: `docs/deployment-walkthrough.md`
- Mobile builds: `docs/mobile-build-guide.md`
- Supabase setup: `docs/deployment-walkthrough.md`
