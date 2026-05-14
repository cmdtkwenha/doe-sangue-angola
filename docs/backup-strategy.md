# Backup Strategy

This document explains the backup plan for Doe Sangue Angola in simple language.

The current version uses mock backup status only. No real backup provider is connected yet.

## Goal

Backups protect the platform from data loss.

They should help recover:

- User accounts.
- Donor profiles.
- Hospital profiles.
- Blood requests.
- Appointments.
- Notifications.
- Rewards.
- Audit logs.

## Current State

The platform is prepared for backup planning, but it is not yet connected to a live database backup service.

Today:

- Mock data is used for demos.
- Supabase schema is prepared.
- Backup status is shown as a placeholder in the monitoring dashboard.
- Documentation explains the future process.

## Future Production Strategy

When Supabase is live, use this backup model:

| Backup Type | Frequency | Purpose |
| --- | --- | --- |
| Daily database snapshot | Every day | Restore the full platform after a major issue. |
| Point-in-time recovery | Continuous if available | Recover from accidental deletes or bad updates. |
| Weekly export | Every week | Keep a portable copy for compliance review. |
| Audit log export | Every day | Preserve accountability records. |
| Configuration export | After every release | Restore environment settings safely. |

## What Must Be Backed Up

Priority 1:

- `users`
- `donors`
- `hospitals`
- `blood_requests`
- `appointments`
- `audit_logs`

Priority 2:

- `notifications`
- `rewards`
- `referrals`
- `fraud_reviews`
- `family_emergency_requests`

## Database Export Placeholder

Future technical command example:

```bash
supabase db dump --file backups/doesangue-YYYY-MM-DD.sql
```

This command is only a placeholder until Supabase is connected.

## Backup Storage Rules

Future backups should be stored in:

- A secure cloud storage folder.
- A restricted admin account.
- A second private location for disaster recovery.

Do not store backups in public GitHub repositories.

## Founder Checklist

Before real launch, confirm:

1. Supabase backup settings are enabled.
2. Daily backups are working.
3. A test restore has been completed.
4. Backup access is limited to trusted people.
5. The recovery plan is reviewed with the technical team.

## Simple Rule

If the platform contains real donor or hospital data, backups must be real, tested, and access-controlled.
