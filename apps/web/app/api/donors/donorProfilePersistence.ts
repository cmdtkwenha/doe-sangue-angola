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
  const publicUserId = await upsertPublicUser(db, input);
  const query = db
    .from("donors")
    .upsert(buildPayload(input, publicUserId), { onConflict: "user_id" });
  const { data, error } = await query.select(donorColumns).single();
  if (error) throw new Error(formatSupabaseError(error));
  await recordConsent(db, input).catch((error) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[donor] Consentimento legal não bloqueou onboarding", error);
    }
  });
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
  const payload = {
    account_status: "Ativo",
    auth_user_id: input.userId,
    email: input.email,
    name: input.fullName || input.email.split("@")[0] || "Utilizador",
    phone: input.phone,
    role: "donor"
  };
  const { data: existing, error: findError } = await db
    .from("users")
    .select("id")
    .or(`auth_user_id.eq.${input.userId},email.eq.${input.email}`)
    .maybeSingle();
  if (findError) throw new Error(formatSupabaseError(findError));

  const publicUserId = existing?.id ?? input.userId;
  const query = existing?.id
    ? db.from("users").update(payload).eq("id", existing.id)
    : db.from("users").insert({ ...payload, id: publicUserId });
  const { error } = await query;
  if (error) throw new Error(formatSupabaseError(error));
  return publicUserId;
}

function buildPayload(input: SaveDonorInput, publicUserId: string) {
  return {
    available: true,
    birth_date: input.birthDate || null,
    blood_type: input.bloodType,
    consent_accepted_at: new Date().toISOString(),
    consent_version: input.consentVersion,
    emergency_contact_name: input.emergencyContactName,
    emergency_contact_phone: input.emergencyContactPhone,
    eligibility_status: "Elegível",
    gender: input.gender,
    medical_disclaimer_version: input.consentVersion,
    municipality: input.municipality,
    phone: input.phone,
    privacy_policy_version: input.consentVersion,
    province: input.province,
    user_id: publicUserId
  };
}

export const donorColumns = [
  "id",
  "emergency_contact_name",
  "emergency_contact_phone",
  "blood_type",
  "province",
  "municipality",
  "phone",
  "gender",
  "available",
  "birth_date",
  "eligibility_status",
  "consent_accepted_at",
  "consent_version",
  "privacy_policy_version",
  "medical_disclaimer_version",
  "last_donation",
  "last_donation_date",
  "points",
  "preferred_hospital_id",
  "reliability_score",
  "response_speed_minutes",
  "user_id"
].join(",");

function formatSupabaseError(error: { message: string }) {
  return error.message;
}
