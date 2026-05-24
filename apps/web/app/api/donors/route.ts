import { mapDonor, type DonorRow } from "@doe-sangue-angola/shared-services";
import type { BloodType, Donor } from "@doe-sangue-angola/shared-types";
import { auditApiAction } from "../_utils/audit";
import { ApiError, apiResponse, readJson } from "../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireAuthUser, requireSameOrigin } from "../_utils/security";
import { assertBloodType, assertString, optionalString } from "../_utils/validation";

type DonorBody = {
  birthDate: string;
  bloodType: BloodType;
  authUserId?: string;
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
        .or(`auth_user_id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();
      if (error) throw new Error(formatSupabaseError(error));
      return data ? mapDonor(data as unknown as DonorRow) : null;
    }
    if (principal.role !== "admin") throw new ApiError(403, "Lista restrita ao admin.");
    const { data, error } = await db
      .from("donors")
      .select(donorColumns)
      .order("full_name", { ascending: true });
    if (error) throw new Error(formatSupabaseError(error));
    return (data as unknown as DonorRow[]).map(mapDonor);
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
    const authUserId = body.authUserId || authUser.id;
    if (profile.role !== "admin" && authUserId !== authUser.id) {
      throw new ApiError(403, "Só pode atualizar o seu perfil de dador.");
    }
    const donor = await saveDonor(db, {
      authUserId,
      birthDate: assertBirthDate(body.birthDate),
      bloodType: assertBloodType(body.bloodType),
      email: optionalString(body.email, 180) ?? authUser.email ?? profile.email,
      emergencyContactName: optionalString(body.emergencyContactName, 120),
      emergencyContactPhone: optionalString(body.emergencyContactPhone, 40),
      fullName: assertString(body.fullName, "Nome completo", 180),
      gender: assertGender(body.gender),
      municipality: assertString(body.municipality, "Município", 120),
      phone: assertString(body.phone, "Telefone", 40),
      profileId: profile.id,
      province: assertString(body.province, "Província", 120)
    });
    const { error: linkError } = await db
      .from("profiles")
      .update({ linked_entity_id: donor.id, role: "donor" })
      .eq("auth_user_id", authUserId);
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

type DbClient = Awaited<ReturnType<typeof createRouteSupabase>>;

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

async function saveDonor(db: DbClient, input: SaveDonorInput): Promise<Donor> {
  const payload = {
    auth_user_id: input.authUserId,
    birth_date: input.birthDate || null,
    blood_type: input.bloodType,
    eligibility_status: "Elegível",
    email: input.email,
    emergency_contact_name: input.emergencyContactName,
    emergency_contact_phone: input.emergencyContactPhone,
    full_name: input.fullName,
    gender: input.gender,
    municipality: input.municipality,
    phone: input.phone,
    province: input.province,
    user_id: input.profileId,
    available: true
  };
  const { data: existing, error: findError } = await db
    .from("donors")
    .select("id")
    .eq("auth_user_id", input.authUserId)
    .maybeSingle();
  if (findError) throw new Error(formatSupabaseError(findError));
  const query = existing?.id
    ? db.from("donors").update(payload).eq("id", existing.id)
    : db.from("donors").insert(payload);
  const { data, error } = await query.select(donorColumns).single();
  if (error) throw new Error(formatSupabaseError(error));
  return mapDonor(data as unknown as DonorRow);
}

type SaveDonorInput = {
  authUserId: string;
  birthDate: string;
  bloodType: BloodType;
  email: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  fullName: string;
  gender?: string;
  municipality: string;
  phone: string;
  profileId: string;
  province: string;
};

const donorColumns = [
  "id",
  "auth_user_id",
  "full_name",
  "email",
  "phone",
  "blood_type",
  "province",
  "municipality",
  "gender",
  "available",
  "birth_date",
  "last_donation",
  "last_donation_date",
  "total_donations",
  "eligibility_status",
  "points",
  "preferred_hospital_id",
  "user_id"
].join(",");

function formatSupabaseError(error: {
  code?: string;
  details?: string;
  hint?: string;
  message: string;
}) {
  return [
    `Erro Supabase: ${error.message}`,
    error.code ? `Código: ${error.code}` : "",
    error.details ? `Detalhes: ${error.details}` : "",
    error.hint ? `Sugestão: ${error.hint}` : ""
  ].filter(Boolean).join(" | ");
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
