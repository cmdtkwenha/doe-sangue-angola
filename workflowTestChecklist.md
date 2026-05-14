# Workflow Test Checklist

Use this checklist before investor demos or release reviews.

## Access

- Admin can open `/auth` and sign in with an Admin account when Supabase Auth is configured.
- Hospital can open `/auth` and sign in with a Hospital/Clinic account.
- Donor can open `/auth` and sign in with a Donor account.
- Role redirects are correct: Admin to `/admin`, Hospital to `/hospital`, Donor to `/mobile`.

## End-To-End Blood Request Flow

1. Hospital creates an urgent O- blood request.
2. Request appears in Admin live requests.
3. `matchingAgent` finds compatible donors.
4. Donor notification is created.
5. Donor sees the request in the mobile experience.
6. Donor accepts the request.
7. `schedulingAgent` creates a 4-digit PIN.
8. Hospital sees incoming donor and PIN status.
9. Hospital validates the PIN.
10. Request status changes to `PIN Validado`.
11. Donation is marked `Concluído`.
12. `rewardAgent` updates donor points.
13. Completion notification is created for the donor.
14. Audit logs record request, matching, notification, PIN, completion and reward actions.

## UI Stability

- Admin dashboard shows verification and system health panels.
- Hospital dashboard keeps request, donor, inventory and PIN states visible.
- Mobile app shows nearby requests, notifications, rewards and donor profile.
- Empty, loading, error and offline states remain in Portuguese.

## Commands

Run:

```bash
npm run check:lines
npm run audit
npm run lint
npm run test
npm run typecheck
```

The automated workflow test covers the full mock lifecycle from request creation to reward and audit.
