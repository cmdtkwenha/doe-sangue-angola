import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { auditApiAction } from "../../_utils/audit";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";
import { assertString, optionalString } from "../../_utils/validation";

type Body = {
  address?: string;
  email?: string;
  hospitalId?: string;
  licenseNumber?: string;
  mode?: "register" | "select";
  municipality?: string;
  name?: string;
  phone?: string;
  province?: string;
  responsiblePerson?: string;
  type?: string;
};

const allowedTypes = ["Hospital", "Clínica", "Centro Médico", "Banco de Sangue"];

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<Body>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const db = await createRouteSupabase();
    const writeDb = createPrivilegedSupabase() ?? db;
    const hospitalId = body.mode === "register"
      ? await registerHospital(writeDb, body)
      : await selectApprovedHospital(writeDb, body.hospitalId);
    await linkHospitalUser(writeDb, principal, hospitalId);
    await db.from("legal_consents").insert({
      consent_type: "hospital_responsibility",
      page: "/onboarding/hospital",
      role: "hospital",
      user_id: principal.authUserId,
      version: "pilot-v1"
    });
    await auditApiAction(principal, `Ligou conta hospitalar ao hospital ${hospitalId}.`);
    return {
      hospitalId,
      message: body.mode === "register"
        ? "Hospital registado com sucesso. Aguarde verificação da Administração Nacional."
        : "Hospital ligado com sucesso."
    };
  });
}

async function registerHospital(db: Db, body: Body) {
  const type = assertHospitalType(body.type);
  const { data, error } = await db
    .from("hospitals")
    .insert({
      address: assertString(body.address, "Morada", 240),
      capacity: 0,
      contact: assertString(body.responsiblePerson, "Pessoa responsável", 160),
      email: optionalString(body.email, 180),
      facility_type: type,
      license_number: assertString(body.licenseNumber, "Número da licença sanitária", 120),
      municipality: assertString(body.municipality, "Município", 120),
      name: assertString(body.name, "Nome do hospital/clínica", 180),
      phone: assertString(body.phone, "Telefone", 80),
      province: assertString(body.province, "Província", 120),
      status: "Pendente",
      type,
      verification_status: "Pendente",
      verified: false
    })
    .select("id")
    .single();
  if (error) throw new Error(`Registo do hospital: ${error.message}`);
  return data.id as string;
}

async function selectApprovedHospital(db: Db, hospitalId?: string) {
  const id = assertString(hospitalId, "Hospital");
  const { data, error } = await db
    .from("hospitals")
    .select("id,verified,verification_status")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Hospital aprovado: ${error.message}`);
  if (!data?.id || !data.verified || !isVerified(data.verification_status)) {
    throw new ApiError(404, "Hospital aprovado não encontrado.");
  }
  return data.id as string;
}

async function linkHospitalUser(db: Db, principal: Awaited<ReturnType<typeof requireApiSession>>, hospitalId: string) {
  const patch = { linked_entity_id: hospitalId, role: "hospital" };
  const { error: userError } = await db
    .from("users")
    .update(patch)
    .or(`id.eq.${principal.profileId},auth_user_id.eq.${principal.authUserId}`);
  if (userError) throw new Error(`Ligação do utilizador: ${userError.message}`);
  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .eq("auth_user_id", principal.authUserId)
    .maybeSingle();
  const payload = {
    account_status: "Ativo",
    auth_user_id: principal.authUserId,
    email: principal.email,
    linked_entity_id: hospitalId,
    name: principal.name,
    role: "hospital"
  };
  const query = profile?.id
    ? db.from("profiles").update(payload).eq("id", profile.id)
    : db.from("profiles").insert(payload);
  const { error } = await query;
  if (error) throw new Error(`Ligação do perfil: ${error.message}`);
}

function assertHospitalType(value: unknown) {
  const type = assertString(value, "Tipo", 80);
  if (!allowedTypes.includes(type)) throw new ApiError(400, "Tipo de instituição inválido.");
  return type;
}

function isVerified(status?: string | null) {
  return status === "Verificado" || status === "verified";
}

function createPrivilegedSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

type Db = Awaited<ReturnType<typeof createRouteSupabase>> | SupabaseClient;
