import { mapDonor, type DonorRow } from "@doe-sangue-angola/shared-services";
import type { BloodType, Donor } from "@doe-sangue-angola/shared-types";
import { ApiError } from "../_utils/apiResponse";
import type { createRouteSupabase } from "../_utils/security";

type DbClient = Awaited<ReturnType<typeof createRouteSupabase>>;

export type SaveDonorInput = {
  birthDate: string;
  bloodType: BloodType;
  consentAccepted: boolean;
  consentVersion: string;
  email: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  fullName: string;
  gender?: string;
  municipality: string;
  phone: string;
  province: string;
  userId: string;
};

export async function saveDonor(db: DbClient, input: SaveDonorInput): Promise<Donor> {
  if (!input.consentAccepted) {
    throw new ApiError(400, "Aceite os termos, privacidade e aviso médico para continuar.");
  }
  await upsertPublicUser(db, input);
  const query = db
    .from("donors")
    .upsert(buildPayload(input), { onConflict: "user_id" });
  const { data, error } = await query.select(donorColumns).single();
  if (error) throw new Error(formatSupabaseError(error));
  await recordConsent(db, input);
  return mapDonor(data as unknown as DonorRow);
}

async function recordConsent(db: DbClient, input: SaveDonorInput) {
  const { error } = await db.from("legal_consents").insert({
    consent_type: "donor_onboarding",
    page: "/onboarding/donor",
    role: "donor",
    user_id: input.userId,
    version: input.consentVersion
  });
  if (error) throw new Error(formatSupabaseError(error));
}

async function upsertPublicUser(db: DbClient, input: SaveDonorInput) {
  const { error } = await db
    .from("users")
    .upsert({
      auth_user_id: input.userId,
      email: input.email,
      id: input.userId,
      name: input.fullName || input.email.split("@")[0] || "Utilizador",
      phone: input.phone,
      role: "donor"
    }, { onConflict: "email" });
  if (error) throw new Error(formatSupabaseError(error));
}

function buildPayload(input: SaveDonorInput) {
  return {
    available: true,
    birth_date: input.birthDate || null,
    blood_type: input.bloodType,
    consent_accepted_at: new Date().toISOString(),
    consent_version: input.consentVersion,
    medical_disclaimer_version: input.consentVersion,
    privacy_policy_version: input.consentVersion,
    eligibility_status: "Elegível",
    email: input.email,
    emergency_contact_name: input.emergencyContactName,
    emergency_contact_phone: input.emergencyContactPhone,
    full_name: input.fullName,
    gender: input.gender,
    municipality: input.municipality,
    phone: input.phone,
    province: input.province,
    user_id: input.userId
  };
}

export const donorColumns = [
  "id",
  "full_name",
  "email",
  "emergency_contact_name",
  "emergency_contact_phone",
  "phone",
  "blood_type",
  "province",
  "municipality",
  "gender",
  "available",
  "birth_date",
  "consent_accepted_at",
  "consent_version",
  "last_donation",
  "last_donation_date",
  "total_donations",
  "eligibility_status",
  "points",
  "preferred_hospital_id",
  "reliability_score",
  "response_speed_minutes",
  "user_id"
].join(",");

function formatSupabaseError(error: { message: string }) {
  return error.message;
}
