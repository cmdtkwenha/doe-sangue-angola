import { auditApiAction } from "../../_utils/audit";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";
import { assertRole, assertString } from "../../_utils/validation";

type Body = {
  action?: string;
  donorId?: string;
  hospitalId?: string;
  profileId?: string;
  role?: string;
};

const actions = [
  "change_role",
  "suspend_user",
  "reactivate_user",
  "reset_role",
  "force_password_reset",
  "unlink_hospital",
  "unlink_donor",
  "link_hospital",
  "approve_hospital",
  "suspend_hospital",
  "verify_donor",
  "review_donor",
  "suspend_donor"
];

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const [profiles, hospitals, donors] = await Promise.all([
      db.from("profiles").select("*").order("created_at", { ascending: false }),
      db.from("hospitals").select("id,name,province,municipality,verification_status,verified").order("name"),
      db.from("donors").select("id,user_id,blood_type,province,municipality,eligibility_status,available,points").order("created_at", { ascending: false })
    ]);
    if (profiles.error) throw new Error(`profiles select: ${profiles.error.message}`);
    if (hospitals.error) throw new Error(`hospitals select: ${hospitals.error.message}`);
    if (donors.error) throw new Error(`donors select: ${donors.error.message}`);
    return {
      donors: donors.data ?? [],
      hospitals: hospitals.data ?? [],
      users: (profiles.data ?? []).map((profile) => ({
        ...profile,
        linkedName: linkedName(profile.linked_entity_id, hospitals.data ?? [], donors.data ?? []),
        linkedType: linkedType(profile.linked_entity_id, hospitals.data ?? [], donors.data ?? [])
      }))
    };
  });
}

export async function PATCH(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<Body>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["admin"]);
    const action = normalizeAction(body.action);
    const profileId = assertString(body.profileId, "Utilizador");
    const db = await createRouteSupabase();
    const { data: profile, error } = await db.from("profiles").select("*").eq("id", profileId).maybeSingle();
    if (error) throw new Error(`profiles select: ${error.message}`);
    if (!profile) throw new ApiError(404, "Utilizador não encontrado.");
    if (profile.auth_user_id === principal.authUserId && ["suspend_user", "reset_role"].includes(action)) {
      throw new ApiError(400, "Não pode bloquear ou repor a própria conta administrativa.");
    }
    await applyAction(db, action, profile, body);
    await auditApiAction(principal, `Admin executou ${action} para ${profile.email ?? profile.id}.`);
    return { updated: true };
  });
}

async function applyAction(db: Awaited<ReturnType<typeof createRouteSupabase>>, action: string, profile: Record<string, string | null>, body: Body) {
  if (action === "change_role") {
    await updateProfile(db, profile, { linked_entity_id: null, role: assertRole(body.role) });
  }
  if (action === "suspend_user") await updateProfile(db, profile, { account_status: "Suspenso" });
  if (action === "reactivate_user") await updateProfile(db, profile, { account_status: "Ativo" });
  if (action === "reset_role") await updateProfile(db, profile, { linked_entity_id: null, role: "viewer" });
  if (action === "force_password_reset") await updateProfile(db, profile, { password_reset_requested_at: new Date().toISOString() });
  if (action === "unlink_hospital" && profile.role === "hospital") await updateProfile(db, profile, { linked_entity_id: null });
  if (action === "unlink_donor" && profile.role === "donor") await updateProfile(db, profile, { linked_entity_id: null });
  if (action === "link_hospital") await updateProfile(db, profile, { linked_entity_id: assertString(body.hospitalId, "Hospital"), role: "hospital" });
  if (action === "approve_hospital") await updateHospital(db, body.hospitalId ?? profile.linked_entity_id, { verification_status: "Verificado", verified: true });
  if (action === "suspend_hospital") await updateHospital(db, body.hospitalId ?? profile.linked_entity_id, { verification_status: "Suspenso", verified: false });
  if (action === "verify_donor") await updateDonor(db, body.donorId ?? profile.linked_entity_id, { available: true, eligibility_status: "Verificado" });
  if (action === "review_donor") await updateDonor(db, body.donorId ?? profile.linked_entity_id, { available: false, eligibility_status: "Revisão Necessária" });
  if (action === "suspend_donor") await updateDonor(db, body.donorId ?? profile.linked_entity_id, { available: false, eligibility_status: "Suspenso" });
}

async function updateProfile(db: Awaited<ReturnType<typeof createRouteSupabase>>, profile: Record<string, string | null>, patch: Record<string, string | null>) {
  const payload = { ...patch, updated_at: new Date().toISOString() };
  const { error } = await db.from("profiles").update(payload).eq("id", profile.id);
  if (error) throw new Error(`profiles update: ${error.message}`);
  if (profile.auth_user_id) {
    await db.from("users").update(payload).eq("auth_user_id", profile.auth_user_id);
  }
}

async function updateHospital(db: Awaited<ReturnType<typeof createRouteSupabase>>, id: string | null | undefined, patch: Record<string, boolean | string>) {
  if (!id) throw new ApiError(400, "Hospital não está ligado a esta conta.");
  const { error } = await db.from("hospitals").update(patch).eq("id", id);
  if (error) throw new Error(`hospitals update: ${error.message}`);
}

async function updateDonor(db: Awaited<ReturnType<typeof createRouteSupabase>>, id: string | null | undefined, patch: Record<string, boolean | string>) {
  if (!id) throw new ApiError(400, "Dador não está ligado a esta conta.");
  const { error } = await db.from("donors").update(patch).eq("id", id);
  if (error) throw new Error(`donors update: ${error.message}`);
}

function normalizeAction(value?: string) {
  if (!actions.includes(value ?? "")) throw new ApiError(400, "Ação administrativa inválida.");
  return value as string;
}

function linkedName(id: string | null, hospitals: Array<Record<string, string>>, donors: Array<Record<string, string>>) {
  return hospitals.find((item) => item.id === id)?.name ?? donors.find((item) => item.id === id)?.blood_type ?? "Sem ligação";
}

function linkedType(id: string | null, hospitals: Array<Record<string, string>>, donors: Array<Record<string, string>>) {
  if (hospitals.some((item) => item.id === id)) return "hospital";
  if (donors.some((item) => item.id === id)) return "donor";
  return "none";
}
