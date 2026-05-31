# Fresh Pilot Test Script

Use this script after applying all Supabase migrations and before a clean pilot
demo. It resets only workflow history, then validates the full live flow.

## 1. Reset Workflow Data

Run one of these:

```bash
supabase db execute --file scripts/reset-pilot-workflow-data.sql
```

Or paste `scripts/reset-pilot-workflow-data.sql` into the Supabase SQL Editor.

## Data Preserved

- Auth users
- Public users
- Profiles and roles
- Donor profiles
- Hospitals and imported Angola hospital records
- Legal consent records

## Data Deleted

- Donor responses
- Blood requests
- Notifications
- Audit logs
- Appointments, if the table exists

## 2. Fresh E2E Flow

### Hospital Creates Request

1. Login as a hospital user.
2. Open `/hospital/new-request`.
3. Create an urgent request, preferably `O-`, with 1 or 2 units.
4. Confirm success message appears.
5. Open `/hospital/requests` and verify the request is listed as `Aberto`.

Expected result: request exists in `public.blood_requests`.

### Donor Accepts

1. Login as a compatible donor.
2. Open `/mobile`.
3. Confirm the request appears in available requests.
4. Open request details.
5. Click `Aceitar pedido` and confirm.

Expected result: `public.donor_responses` has one row for donor plus request.

### Donor Sees PIN

1. Stay on `/mobile`.
2. Check `Meu PIN de Doação`.
3. Confirm the card shows hospital name, location, blood type, ETA and PIN.

Expected result: PIN matches `donor_responses.confirmation_pin`.

### Hospital Validates PIN

1. Login as hospital.
2. Open `/hospital/donors`.
3. Confirm the donor appears in `Dadores a Caminho`.
4. Mark `Chegou`.
5. Enter the donor PIN and validate.

Expected result: donor response status becomes `pin_validated`.

### Hospital Completes Donation

1. Click `Doação concluída`.
2. Confirm the action.
3. Verify the donor moves out of the active list.

Expected result: donor response status becomes `completed`.

### Admin Verifies Completion

1. Login as admin.
2. Open `/admin`.
3. Confirm dashboard counts reflect the completed donation.
4. Open `/admin/audit`.
5. Confirm workflow actions were logged.

Expected result: admin sees the completed request and audit trail.

## Failure Handling

If a step fails:

1. Record the page, role and action.
2. Copy the exact Portuguese error message.
3. Check Supabase table rows for the expected record.
4. Do not create new fields during testing; update migrations first.
