# Recovery Plan

This document explains how Doe Sangue Angola should recover from a serious problem.

The current version uses mock recovery status only. No real restore process is connected yet.

## What Recovery Means

Recovery means bringing the platform back to a safe working state after a problem.

Examples:

- A release breaks the app.
- Data is accidentally deleted.
- Supabase has an outage.
- A configuration value is wrong.
- A suspicious action affects real data.

## Recovery Priorities

1. Protect donor and hospital data.
2. Keep emergency blood request information accurate.
3. Restore access for Admin and Hospital users.
4. Preserve audit logs.
5. Communicate clearly with stakeholders.

## Incident Flow

1. Identify the problem.
2. Pause risky actions if needed.
3. Confirm which environment is affected: development, staging, or production.
4. Check the latest successful backup.
5. Decide whether to roll back code, restore data, or both.
6. Restore in staging first when possible.
7. Validate critical workflows.
8. Restore production only after review.
9. Record the incident in audit notes.
10. Share a short summary with the founder.

## Restore Placeholder

Future technical command example:

```bash
supabase db reset --db-url "$DATABASE_URL"
```

This is only a placeholder. A real restore should be performed by the technical team with a verified backup file.

## Critical Workflows To Test After Recovery

1. Admin login.
2. Hospital login.
3. Donor login.
4. Hospital creates request.
5. Admin sees request.
6. Donor accepts request.
7. PIN is generated.
8. Hospital validates PIN.
9. Request is completed.
10. Reward and audit logs update.

## Communication Template

Use this simple update during an incident:

```text
We found an issue affecting Doe Sangue Angola.
The team is working on recovery.
No confirmed data loss has been reported yet.
Next update: [time].
```

## Founder Recovery Checklist

1. Ask which environment is affected.
2. Ask if real donor or hospital data is involved.
3. Ask when the last backup was created.
4. Ask if staging restore was tested.
5. Ask if the critical workflows passed.
6. Approve production recovery only after the team confirms safety.

## When To Escalate

Escalate immediately if:

- Real donor data may be exposed.
- Hospital request data is incorrect.
- Admin users cannot access the platform.
- Audit logs are missing.
- A fraudulent request was created.

## Simple Rule

Never restore production data casually. Restore first in staging, validate, then proceed carefully.
