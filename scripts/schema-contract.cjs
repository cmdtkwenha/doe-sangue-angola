const schemaContract = {
  appointments: ["id", "donor_id", "hospital_id", "blood_request_id", "created_at", "date", "time", "pin", "status"],
  audit_logs: ["id", "actor_label", "action", "created_at"],
  blood_banks: ["id", "name", "province", "municipality", "address", "contact", "email", "facility_type", "license_number", "verified"],
  blood_requests: ["id", "created_by", "hospital_id", "patient_code", "blood_type", "units", "units_needed", "province", "municipality", "notes", "urgency", "status", "created_at"],
  clinics: ["id", "name", "province", "municipality", "address", "contact", "email", "facility_type", "license_number", "verified"],
  donor_responses: ["id", "donor_id", "hospital_id", "blood_request_id", "created_at", "eta_minutes", "confirmation_pin", "status", "accepted_at", "arrived_at", "pin_validated_at", "cancelled_at", "completed_at", "donation_completed_at", "pin_expires_at", "pin_locked_until", "last_pin_attempt_at", "failed_pin_attempts", "reward_accepted_at", "reward_arrived_at", "reward_completed_at"],
  donors: ["id", "user_id", "blood_type", "province", "municipality", "available", "eligibility_status", "last_donation", "points", "preferred_hospital_id", "created_at", "reliability_score", "response_speed_minutes", "next_eligible_donation_date", "consent_accepted_at", "consent_version", "privacy_policy_version", "medical_disclaimer_version", "emergency_contact_name", "emergency_contact_phone", "gender", "birth_date", "latitude", "longitude", "location_permission_status", "last_donation_date"],
  fraud_reviews: ["id", "blood_request_id", "donor_id", "risk", "status", "created_at"],
  hospital_inventory: ["id", "hospital_id", "blood_type", "units_available", "daily_usage_estimate", "safe_minimum", "updated_at"],
  hospitals: ["id", "name", "province", "municipality", "verified", "capacity", "contact", "created_at", "address", "email", "facility_type", "license_number", "phone", "latitude", "longitude"],
  legal_consents: ["id", "user_id", "role", "consent_type", "version", "page", "accepted_at"],
  municipalities: ["id", "name", "province"],
  notification_preferences: ["id", "donor_id", "preferences", "created_at"],
  notifications: ["id", "user_id", "role", "title", "body", "message", "type", "read", "read_at", "created_at"],
  profiles: ["id", "auth_user_id", "role", "linked_entity_id", "name", "email", "phone", "created_at"],
  provinces: ["id", "name"],
  push_tokens: ["id", "donor_id", "platform", "token", "active", "created_at"],
  referrals: ["id", "referrer_donor_id", "invited_name", "status", "reward_points", "created_at"],
  rewards: ["id", "donor_id", "points", "reason", "tier", "created_at"],
  support_issues: ["id", "user_id", "role", "page", "action", "type", "severity", "message", "status", "created_at"],
  users: ["id", "auth_user_id", "role", "name", "email", "phone", "linked_entity_id", "created_at"]
};

module.exports = { schemaContract };
