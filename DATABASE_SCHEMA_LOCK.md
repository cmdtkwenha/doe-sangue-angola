# Doe Sangue Angola Database Schema Lock

This document is the production schema contract for Doe Sangue Angola.
Frontend, mobile, services, repositories and API routes must only read or write
the tables and columns listed here.

## Rule

No frontend or service field can be added without a matching Supabase migration.

If a screen, repository or API needs a new database field:

1. Add a production-safe migration using `create table if not exists` or
   `alter table ... add column if not exists`.
2. Add the field to `scripts/schema-contract.cjs`.
3. Run `npm run schema:verify`.
4. Run `npm run typecheck` and `npm run build`.

Do not patch runtime errors by adding frontend-only fields.

## Production Tables

### appointments
`id`, `donor_id`, `hospital_id`, `blood_request_id`, `created_at`, `date`,
`time`, `pin`, `status`

### audit_logs
`id`, `actor_label`, `action`, `created_at`

### blood_banks
`id`, `name`, `province`, `municipality`, `address`, `contact`, `email`,
`facility_type`, `license_number`, `verified`

### blood_requests
`id`, `created_by`, `hospital_id`, `patient_code`, `blood_type`, `units`,
`units_needed`, `province`, `municipality`, `notes`, `urgency`, `status`,
`created_at`, `request_source`, `family_request_id`

### clinics
`id`, `name`, `province`, `municipality`, `address`, `contact`, `email`,
`facility_type`, `license_number`, `verified`

### donor_responses
`id`, `donor_id`, `hospital_id`, `blood_request_id`, `created_at`,
`eta_minutes`, `confirmation_pin`, `status`, `accepted_at`, `arrived_at`,
`pin_validated_at`, `cancelled_at`, `completed_at`,
`donation_completed_at`, `pin_expires_at`, `pin_locked_until`,
`last_pin_attempt_at`, `failed_pin_attempts`, `reward_accepted_at`,
`reward_arrived_at`, `reward_completed_at`

### donor_verifications
`id`, `donor_id`, `verified_by`, `status`, `notes`, `created_at`,
`updated_at`

### donors
`id`, `user_id`, `blood_type`, `province`, `municipality`, `phone`, `available`,
`eligibility_status`, `last_donation`, `points`, `preferred_hospital_id`, `created_at`,
`reliability_score`, `response_speed_minutes`, `next_eligible_donation_date`,
`consent_accepted_at`, `consent_version`, `privacy_policy_version`,
`medical_disclaimer_version`, `emergency_contact_name`,
`emergency_contact_phone`, `gender`, `birth_date`, `latitude`, `longitude`,
`location_permission_status`, `last_donation_date`

### family_emergency_requests
`id`, `patient_name`, `contact_name`, `contact_phone`, `relationship`,
`hospital_name`, `hospital_id`, `province`, `municipality`, `blood_type`,
`units_needed`, `urgency`, `status`, `review_note`, `blood_request_id`,
`share_token`, `created_at`, `updated_at`

### fraud_reviews
`id`, `blood_request_id`, `donor_id`, `risk`, `status`, `created_at`

### hospital_inventory
`id`, `hospital_id`, `blood_type`, `units_available`, `daily_usage_estimate`,
`safe_minimum`, `minimum_threshold`, `critical_threshold`, `updated_at`

### hospital_notification_preferences
`id`, `hospital_id`, `preferences`, `created_at`, `updated_at`

### hospital_staff
`id`, `hospital_id`, `auth_user_id`, `name`, `email`, `staff_role`, `status`,
`invited_by`, `last_activity_at`, `created_at`, `updated_at`

### hospital_verifications
`id`, `hospital_id`, `verified_by`, `status`, `notes`, `created_at`,
`updated_at`

### inventory_movements
`id`, `hospital_id`, `blood_type`, `movement_type`, `units`, `note`,
`created_by`, `created_at`

### hospitals
`id`, `name`, `province`, `municipality`, `verified`, `verification_status`,
`status`, `rejection_reason`, `capacity`, `contact`, `created_at`, `address`, `email`,
`facility_type`, `license_number`, `phone`, `latitude`, `longitude`,
`main_contact_person`, `operational_phone`, `operational_email`,
`emergency_contact`, `operating_hours`

### legal_consents
`id`, `user_id`, `role`, `consent_type`, `version`, `page`, `accepted_at`

### municipalities
`id`, `name`, `province`

### notification_preferences
`id`, `donor_id`, `preferences`, `created_at`

### notifications
`id`, `user_id`, `role`, `title`, `body`, `message`, `type`, `read`,
`read_at`, `created_at`

### pilot_feedback
`id`, `user_id`, `role`, `page`, `issue_type`, `severity`, `description`,
`contact`, `status`, `created_at`, `updated_at`

### profiles
`id`, `auth_user_id`, `role`, `linked_entity_id`, `name`, `email`, `phone`,
`account_status`, `last_activity_at`, `password_reset_requested_at`,
`created_at`, `updated_at`

### provinces
`id`, `name`

### push_tokens
`id`, `donor_id`, `platform`, `token`, `active`, `created_at`

### referrals
`id`, `referrer_donor_id`, `invited_name`, `status`, `reward_points`,
`created_at`

### rewards
`id`, `donor_id`, `points`, `reason`, `tier`, `created_at`

### support_issues
`id`, `user_id`, `role`, `page`, `action`, `type`, `severity`, `message`,
`status`, `created_at`

### users
`id`, `auth_user_id`, `role`, `name`, `email`, `phone`, `linked_entity_id`,
`account_status`, `last_activity_at`, `password_reset_requested_at`,
`created_at`, `updated_at`

## Workflow Review

Reviewed against this lock:

- Donor onboarding saves only locked `donors` columns.
- Donor accept creates/reads locked `donor_responses` columns.
- Hospital request creation uses locked `blood_requests` columns.
- Hospital ETA/PIN workflow uses locked `donor_responses` columns.
- Notifications and legal consent writes use locked tables.

## Verification

Run:

```bash
npm run schema:verify
```

The command checks migration coverage and scans app Supabase references for
unknown table columns. With Supabase environment variables present, it also
checks the remote database.
