# Donor Schema Audit

Date: 2026-05-31

This file documents every `public.donors` column currently used by Doe Sangue Angola.
The consolidated migration is:

- `supabase/migrations/039_donor_schema_contract.sql`

## Columns Used

Identity and ownership:

- `id`
- `user_id`

Profile fields:

- `blood_type`
- `province`
- `municipality`
- `birth_date`
- `gender`
- `emergency_contact_name`
- `emergency_contact_phone`

Eligibility and donation status:

- `available`
- `last_donation`
- `last_donation_date`
- `next_eligible_donation_date`

Rewards and matching:

- `points`
- `preferred_hospital_id`
- `reliability_score`
- `response_speed_minutes`

Location:

- `latitude`
- `longitude`
- `location_permission_status`

Consent:

- `consent_accepted_at`
- `consent_version`
- `privacy_policy_version`
- `medical_disclaimer_version`

System:

- `created_at`

## Write Paths

- Donor onboarding saves donor fields with `upsert` by `user_id`.
- Name, email and phone are saved in `public.users`, not in `public.donors`.
- Donor location updates only optional location fields.
- Donation completion updates cooldown, availability and last donation date.
- Rewards update donor `points`.

## Read Paths

- Donor dashboard reads the current donor by `user_id`.
- Admin donor tables read registered donors.
- Request matching reads blood type, province, municipality and cooldown fields.
- Hospital accepted donor panels read donor blood type and workflow state.

## Onboarding Contract

Required onboarding fields:

- `blood_type`
- `province`
- `municipality`
- `phone` (stored on `public.users.phone`)
- `gender`
- `emergency_contact_name`
- `emergency_contact_phone`
- `birth_date`
- consent checkbox accepted

Optional fields must not block donor onboarding.

`phone` is required by onboarding but stored on `public.users.phone`.

## Notes

- No new donor fields should be added in application code without updating this audit
  and adding a production-safe migration first.
- `next_eligible_donation_date` is not required for onboarding save. It is used by
  cooldown and eligibility flows after donation completion.
