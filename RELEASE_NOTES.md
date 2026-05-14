# Release Notes

## Launch Candidate 0.1.0

Date: 2026-05-13

Doe Sangue Angola is now prepared as a Launch Candidate for stakeholder review and pilot preparation.

## Highlights

- Connected Admin, Hospital, and Donor experiences.
- Portuguese-first product copy.
- Mock data flow shared across apps.
- Supabase-ready architecture.
- Role-based access model.
- Realtime mock event architecture.
- Notification architecture.
- Expo mobile app preparation.
- Vercel deployment preparation.
- Founder handoff documentation.
- Backup, recovery, audit, compliance, and monitoring placeholders.

## Admin Portal

Included:

- National dashboard.
- KPI cards.
- Angola shortage heatmap.
- Live blood request ticker.
- Blood inventory.
- Shortage alerts.
- Fraud review.
- Hospital verification.
- Reports and exports.
- Compliance audit panel.
- Monitoring dashboard.
- Founder tools.

## Hospital Portal

Included:

- Verified hospital dashboard.
- One-click urgent request.
- Active request management.
- Incoming donor lists.
- Appointment schedule.
- Donor PIN validation.
- Inventory and expiring units.
- Communications.
- Audit history.
- Workflow automation panels.

## Donor Mobile App

Included:

- Premium mobile shell.
- Home screen.
- Available requests.
- Request details modal.
- Donor profile.
- Digital donor card.
- Eligibility checker.
- Rewards, badges, and referrals.
- Notifications.
- Privacy and consent settings.
- Emergency contact management.

## Reliability And Operations

Added:

- Environment modes for development, staging, and production.
- Safe environment validation.
- Monitoring and logging architecture.
- Backup strategy documentation.
- Recovery plan documentation.
- Mock backup status panel.
- Recovery checklist.

## Security And Compliance

Added:

- Role-based route guards.
- Permission matrix.
- Security audit documentation.
- Compliance audit filters.
- Audit timeline.
- CSV audit export.

## Deployment Readiness

Prepared:

- Vercel config.
- Expo EAS config.
- Environment examples.
- Supabase migrations and seed data.
- Founder deployment walkthrough.
- Mobile build guide.

## Quality Gates

Required checks:

```bash
npm run check:lines
npm run typecheck
npm run build
```

Recommended checks:

```bash
npm run audit
npm run lint
npm run test
```

## Limitations

- Real production Supabase data is not enabled by default.
- Real push delivery requires Expo/Firebase configuration.
- Backup and restore integrations are placeholders.
- Real hospital onboarding requires legal and operational approval.

## Release Decision

This release is suitable for:

- Founder handoff.
- Investor demos.
- Stakeholder walkthroughs.
- Staging deployment.
- Pilot planning.

It is not yet a live medical production deployment until backend, security, legal, and operational approvals are complete.
