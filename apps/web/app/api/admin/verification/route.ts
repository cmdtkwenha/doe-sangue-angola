import { auditApiAction } from "../../_utils/audit";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";
import { assertString } from "../../_utils/validation";

type Body = {
  action?: string;
  donorId?: string;
  email?: string;
  hospitalId?: string;
  profileId?: string;
  reason?: string;
};

const actions = [
  "approve_hospital",
  "reject_hospital",
  "review_hospital",
  "suspend_hospital",
  "reactivate_hospital",
  "link_hospital_user",
  "unlink_hospital_user",
  "verify_donor",
  "review_donor",
  "reject_donor",
  "suspend_donor",
  "reactivate_donor"
];

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const db = await createRouteSupabase();
    const [donors, hospitals] = await Promise.all([
      db.from("donor_verifications").select("*").order("created_at", { ascending: false }),
      db.from("hospital_verifications").select("*").order("created_at", { ascending: false })
    ]);
    if (donors.error) throw new Error(`donor_verifications select: ${donors.error.message}`);
    if (hospitals.error) throw new Error(`hospital_verifications select: ${hospitals.error.message}`);
    return { donorVerifications: donors.data ?? [], hospitalVerifications: hospitals.data ?? [] };
  });
}

export async function PATCH(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<Body>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["admin"]);
    const action = normalizeAction(body.action);
    const db = await createRouteSupabase();
    const result = await applyAction(db, action, body, principal.authUserId);
    if (result) {
      await auditApiAction(
        principal,
        `Verificação ${action}; target=${result.targetType}:${result.targetId}; old=${result.oldStatus}; new=${result.newStatus}; at=${new Date().toISOString()}`
      );
    }
    return { updated: true };
  });
}

async function applyAction(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  action: string,
  body: Body,
  adminUserId: string
) {
  if (action === "approve_hospital") {
    return updateHospital(db, body.hospitalId, "approved", adminUserId, body.reason, { verified: true, verification_status: "verified" });
  }
  if (action === "reject_hospital") {
    return updateHospital(db, body.hospitalId, "rejected", adminUserId, body.reason, {
      rejection_reason: body.reason ?? "Rejeitado pela administração.",
      verified: false,
      verification_status: "rejected"
    });
  }
  if (action === "review_hospital") {
    return updateHospital(db, body.hospitalId, "needs_review", adminUserId, body.reason, {
      rejection_reason: body.reason ?? "Revisão documental solicitada.",
      verified: false,
      verification_status: "needs_review"
    });
  }
  if (action === "suspend_hospital") {
    return updateHospital(db, body.hospitalId, "suspended", adminUserId, body.reason, {
      rejection_reason: body.reason ?? "Conta suspensa pela administração.",
      verified: false,
      verification_status: "suspended"
    });
  }
  if (action === "reactivate_hospital") {
    return updateHospital(db, body.hospitalId, "approved", adminUserId, body.reason, { rejection_reason: null, verified: true, verification_status: "verified" });
  }
  if (action === "link_hospital_user") {
    const profileId = body.profileId ?? await profileIdByEmail(db, body.email);
    return updateProfile(db, profileId, { linked_entity_id: assertString(body.hospitalId, "Hospital"), role: "hospital" });
  }
  if (action === "unlink_hospital_user") {
    const profileId = body.profileId ?? await profileIdByEmail(db, body.email);
    return updateProfile(db, profileId, { linked_entity_id: null });
  }
  if (action === "verify_donor") return updateDonor(db, body.donorId, "verified", adminUserId, body.reason, { available: true, eligibility_status: "eligible" });
  if (action === "review_donor") return updateDonor(db, body.donorId, "needs_review", adminUserId, body.reason, { available: false, eligibility_status: "needs_review" });
  if (action === "reject_donor") return updateDonor(db, body.donorId, "rejected", adminUserId, body.reason, { available: false, eligibility_status: "permanently_deferred" });
  if (action === "suspend_donor") return updateDonor(db, body.donorId, "suspended", adminUserId, body.reason, { available: false, eligibility_status: "permanently_deferred" });
  if (action === "reactivate_donor") return updateDonor(db, body.donorId, "verified", adminUserId, body.reason, { available: true, eligibility_status: "eligible" });
}

async function updateHospital(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  id: string | undefined,
  status: string,
  adminUserId: string,
  notes: string | undefined,
  patch: Record<string, boolean | null | string>
) {
  const hospitalId = assertString(id, "Hospital");
  const { data: before } = await db.from("hospitals").select("verification_status,verified").eq("id", hospitalId).maybeSingle();
  const { error } = await db.from("hospitals").update(patch).eq("id", hospitalId);
  if (error) throw new Error(`hospitals update: ${error.message}`);
  await insertVerification(db, "hospital_verifications", { hospital_id: hospitalId, notes, status, verified_by: adminUserId });
  return {
    newStatus: status,
    oldStatus: before?.verification_status ?? (before?.verified ? "approved" : "pending"),
    targetId: hospitalId,
    targetType: "hospital"
  };
}

async function updateDonor(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  id: string | undefined,
  status: string,
  adminUserId: string,
  notes: string | undefined,
  patch: Record<string, boolean | string>
) {
  const donorId = assertString(id, "Dador");
  const { data: before } = await db.from("donors").select("eligibility_status").eq("id", donorId).maybeSingle();
  const { error } = await db.from("donors").update(patch).eq("id", donorId);
  if (error) throw new Error(`donors update: ${error.message}`);
  await insertVerification(db, "donor_verifications", { donor_id: donorId, notes, status, verified_by: adminUserId });
  return {
    newStatus: status,
    oldStatus: before?.eligibility_status ?? "pending",
    targetId: donorId,
    targetType: "donor"
  };
}

async function insertVerification(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  table: "donor_verifications" | "hospital_verifications",
  payload: Record<string, string | undefined>
) {
  const { error } = await db.from(table).insert(payload);
  if (error) throw new Error(`${table} insert: ${error.message}`);
}

async function updateProfile(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  id: string | undefined,
  patch: Record<string, null | string>
) {
  const profileId = assertString(id, "Utilizador");
  const { error } = await db.from("profiles").update(patch).eq("id", profileId);
  if (error) throw new Error(`profiles update: ${error.message}`);
}

async function profileIdByEmail(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  email?: string
) {
  const value = assertString(email, "Email do utilizador");
  const { data, error } = await db
    .from("profiles")
    .select("id")
    .eq("email", value)
    .maybeSingle();
  if (error) throw new Error(`profiles select: ${error.message}`);
  if (!data?.id) throw new ApiError(404, "Utilizador não encontrado.");
  return data.id as string;
}

function normalizeAction(value?: string) {
  if (!actions.includes(value ?? "")) throw new ApiError(400, "Ação de verificação inválida.");
  return value as string;
}
