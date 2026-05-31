# Donor Schema Audit

Date: 2026-05-31

This file documents every `public.donors` column currently used by Doe Sangue Angola.
The consolidated migration is:

- `supabase/migrations/039_donor_schema_contract.sql`

## Columns Used

Identity and ownership:

- `id`
- `auth_user_id`
- `user_id`

Profile fields:

- `full_name`
- `email`
- `phone`
- `blood_type`
- `province`
- `municipality`
- `birth_date`
- `gender`
- `emergency_contact_name`
- `emergency_contact_phone`

Eligibility and donation status:

- `available`
- `eligibility_status`
- `last_donation`
- `last_donation_date`
- `next_eligible_donation_date`
- `total_donations`

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

- Donor onboarding saves profile fields with `upsert` by `user_id`.
- Donor location updates only optional location fields.
- Donation completion updates cooldown, availability, totals and last donation date.
- Rewards update donor `points`.

## Read Paths

- Donor dashboard reads the current donor by `user_id`.
- Admin donor tables read registered donors.
- Request matching reads blood type, province, municipality and eligibility fields.
- Hospital accepted donor panels read donor name, blood type and phone.

## Onboarding Contract

Required onboarding fields:

- `blood_type`
- `province`
- `municipality`
- `phone`
- `gender`
- `emergency_contact_name`
- `emergency_contact_phone`
- `birth_date`
- consent checkbox accepted

Optional fields must not block donor onboarding.

## Notes

- No new donor fields should be added in application code without updating this audit
  and adding a production-safe migration first.
- `next_eligible_donation_date` is not required for onboarding save. It is used by
  cooldown and eligibility flows after donation completion.
