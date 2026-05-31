import { mapDonor, type DonorRow } from "@doe-sangue-angola/shared-services";
import type { BloodType } from "@doe-sangue-angola/shared-types";
import { auditApiAction } from "../_utils/audit";
import { ApiError, apiResponse, readJson } from "../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireAuthUser, requireSameOrigin } from "../_utils/security";
import { assertBloodType, assertString, optionalString } from "../_utils/validation";
import { donorColumns, saveDonor } from "./donorProfilePersistence";

type DbClient = Awaited<ReturnType<typeof createRouteSupabase>>;

type DonorBody = {
  birthDate: string;
  bloodType: BloodType;
  consentAccepted?: boolean;
  consentVersion?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  fullName: string;
  gender?: string;
  municipality: string;
  phone: string;
  province: string;
  userId: string;
};

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const userId = new URL(request.url).searchParams.get("userId");
    const db = await createRouteSupabase();
    if (userId === "missing") return null;
    if (userId) {
      if (principal.role !== "admin" && principal.authUserId !== userId && principal.profileId !== userId) {
        throw new ApiError(403, "Acesso negado ao perfil do dador.");
      }
      const { data, error } = await db
        .from("donors")
        .select(donorColumns)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw new Error(formatSupabaseError(error));
      return data ? await enrichDonor(db, data as unknown as DonorRow) : null;
    }
    if (principal.role === "hospital" && principal.hospitalId) {
      const { data: appointments, error: appointmentError } = await db
        .from("appointments")
        .select("donor_id")
        .eq("hospital_id", principal.hospitalId);
      if (appointmentError) throw new Error(formatSupabaseError(appointmentError));
      const donorIds = [...new Set((appointments ?? []).map((item) => item.donor_id).filter(Boolean))];
      if (!donorIds.length) return [];
      const { data, error } = await db
        .from("donors")
        .select(donorColumns)
        .in("id", donorIds)
        .order("created_at", { ascending: false });
      if (error) throw new Error(formatSupabaseError(error));
      return Promise.all((data as unknown as DonorRow[]).map((row) => enrichDonor(db, row)));
    }
    if (principal.role !== "admin") throw new ApiError(403, "Lista restrita ao admin.");
    const { data, error } = await db
      .from("donors")
      .select(donorColumns)
      .order("created_at", { ascending: false });
    if (error) throw new Error(formatSupabaseError(error));
    return Promise.all((data as unknown as DonorRow[]).map((row) => enrichDonor(db, row)));
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<DonorBody>(request);
  return apiResponse(async () => {
    const authUser = await requireAuthUser();
    const db = await createRouteSupabase();
    const profile = await ensureProfile(db, authUser, body);
    if (!["donor", "admin"].includes(profile.role)) {
      throw new ApiError(403, "Perfil sem permissão para guardar dador.");
    }
    const donor = await saveDonor(db, {
      birthDate: assertBirthDate(body.birthDate),
      bloodType: assertBloodType(body.bloodType),
      email: optionalString(body.email, 180) ?? authUser.email ?? profile.email,
      emergencyContactName: optionalString(body.emergencyContactName, 120),
      emergencyContactPhone: optionalString(body.emergencyContactPhone, 40),
      fullName: assertString(body.fullName, "Nome completo", 180),
      gender: assertGender(body.gender),
      municipality: assertString(body.municipality, "Município", 120),
      phone: assertString(body.phone, "Telefone", 40),
      userId: authUser.id,
      province: assertString(body.province, "Província", 120),
      consentAccepted: body.consentAccepted === true,
      consentVersion: optionalString(body.consentVersion, 40) ?? "pilot-v1"
    });
    const { error: linkError } = await db
      .from("profiles")
      .update({ linked_entity_id: donor.id, role: "donor" })
      .eq("auth_user_id", authUser.id);
    if (linkError) throw new Error(formatSupabaseError(linkError));
    await auditApiAction({
      authUserId: authUser.id,
      donorId: donor.id,
      email: authUser.email ?? profile.email,
      name: profile.name,
      profileId: profile.id,
      role: "donor"
    }, `Atualizou perfil de dador ${donor.id}.`);
    return donor;
  });
}

async function enrichDonor(db: DbClient, row: DonorRow) {
  const donor = mapDonor(row);
  if (!row.user_id) return donor;
  const { data } = await db
    .from("users")
    .select("name,email,phone")
    .eq("id", row.user_id)
    .maybeSingle();
  return {
    ...donor,
    email: data?.email ?? donor.email,
    name: data?.name ?? donor.name,
    phone: data?.phone ?? donor.phone
  };
}

async function ensureProfile(db: DbClient, authUser: { id: string; email?: string }, body: Partial<DonorBody>) {
  const { data: existing, error: findError } = await db
    .from("profiles")
    .select("id,auth_user_id,email,name,role")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();
  if (findError) throw new Error(formatSupabaseError(findError));
  if (existing?.id) return existing;
  const { data, error } = await db
    .from("profiles")
    .insert({
      auth_user_id: authUser.id,
      email: body.email ?? authUser.email ?? "",
      name: body.fullName ?? authUser.email ?? "Dador",
      role: "donor"
    })
    .select("id,auth_user_id,email,name,role")
    .single();
  if (error) throw new Error(formatSupabaseError(error));
  return data;
}

function formatSupabaseError(error: { message: string }) {
  return error.message;
}

function assertGender(value: unknown) {
  const gender = assertString(value, "Género", 20);
  if (!["Masculino", "Feminino"].includes(gender)) {
    throw new ApiError(400, "Género deve ser Masculino ou Feminino.");
  }
  return gender;
}

function assertBirthDate(value: unknown) {
  const birthDate = assertString(value, "Data de nascimento", 20);
  const date = new Date(`${birthDate}T00:00:00`);
  const max = new Date();
  max.setFullYear(max.getFullYear() - 18);
  if (Number.isNaN(date.getTime()) || date > max) {
    throw new ApiError(400, "Dador deve ter pelo menos 18 anos.");
  }
  return birthDate;
}
