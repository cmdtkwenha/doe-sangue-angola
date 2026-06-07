import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { notifyAdmins, notifyUser } from "../../_utils/notifications";
import { assertPin, assertString, optionalString } from "../../_utils/validation";
import { assertPinRate, clearPinFailures, recordFailedPin } from "../pinSecurity";
import {
  acceptanceStatus,
  assertTransition,
  auditMessage,
  normalizeActionStatus,
  normalizeCurrentStatus,
  statusPayload,
  type ResponseStatus,
  workflowMessage,
  workflowTitle
} from "./statusHelpers";

type StatusBody = { confirmationPin?: string; responseId: string; status: string };
const allowed: ResponseStatus[] = ["Chegou", "Cancelado", "Doação concluída", "Não Compareceu", "PIN Validado"];

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<StatusBody>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const db = await createRouteSupabase();
    const responseId = assertString(body.responseId, "Resposta do dador");
    const { data: existing, error } = await db
      .from("donor_responses")
      .select("id,blood_request_id,donor_id,hospital_id,confirmation_pin,failed_pin_attempts,pin_expires_at,pin_locked_until,status,blood_requests(blood_type,family_request_id)")
      .eq("id", responseId)
      .single();
    if (error) throw supabaseError("Não foi possível carregar a resposta do dador", error);
    requireEntityAccess(principal, "hospital", existing.hospital_id);
    const status = normalizeActionStatus(body.status);
    if (!status || !allowed.includes(status)) throw new ApiError(400, "Estado inválido.");
    assertTransition(normalizeCurrentStatus(existing.status), status);
    if (status === "PIN Validado") {
      const pin = assertPin(optionalString(body.confirmationPin, 4));
      assertPinRate(existing);
      if (pin !== existing.confirmation_pin) {
        await recordFailedPin(db, principal, responseId);
        throw new ApiError(400, "PIN inválido. Confirme os 4 dígitos com o dador.");
      }
      if (existing.pin_expires_at && new Date(existing.pin_expires_at).getTime() < Date.now()) {
        throw new ApiError(409, "PIN expirado. Gere um novo compromisso de doação.");
      }
    }

    const payload = statusPayload(status);
    const { data, error: updateError } = await db
      .from("donor_responses")
      .update(payload)
      .eq("id", responseId)
      .select("id,status")
      .single();
    if (updateError) throw supabaseError("Não foi possível atualizar o estado do dador", updateError);
    if (status === "PIN Validado") await clearPinFailures(db, responseId);
    await syncAcceptance(db, existing, status);
    await applyOperationalEffects(db, responseId, existing, principal.authUserId, status);
    await syncRequest(db, existing.blood_request_id, status);
    await syncFamilyRequest(db, familyId(existing), status);
    await notifyDonor(db, existing.donor_id, status);
    if (status === "Doação concluída" || status === "Cancelado" || status === "Não Compareceu") {
      await notifyAdmins(db, workflowTitle(status), workflowMessage(status), status);
    }
    await auditApiAction(principal, auditMessage(status, responseId));
    return data;
  });
}

async function syncFamilyRequest(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  familyRequestId: string | undefined,
  status: ResponseStatus
) {
  if (!familyRequestId || !["Doação concluída", "Cancelado"].includes(status)) return;
  const next = status === "Doação concluída" ? "Resolvido" : "Cancelado";
  await db.from("family_emergency_requests").update({
    status: next,
    updated_at: new Date().toISOString()
  }).eq("id", familyRequestId);
}

function familyId(row: { blood_requests?: unknown }) {
  const request = Array.isArray(row.blood_requests) ? row.blood_requests[0] : row.blood_requests;
  return (request as { family_request_id?: string | null } | undefined)?.family_request_id ?? undefined;
}

async function applyOperationalEffects(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  responseId: string,
  existing: {
    blood_requests?: unknown;
    donor_id: string;
    hospital_id: string;
  },
  createdBy: string,
  status: ResponseStatus
) {
  if (status === "Chegou") await rewardOnce(db, responseId, existing.donor_id, 40, "Chegada confirmada", "reward_arrived_at");
  if (status === "Doação concluída") {
    await rewardOnce(db, responseId, existing.donor_id, 120, "Doação concluída", "reward_completed_at");
    await updateCooldown(db, existing.donor_id);
    await receiveInventory(db, existing, createdBy);
  }
}

async function receiveInventory(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  existing: { blood_requests?: unknown; hospital_id: string },
  createdBy: string
) {
  const bloodType = requestBloodType(existing);
  if (!bloodType) return;
  const current = await currentInventory(db, existing.hospital_id, bloodType);
  const { error: inventoryError } = await db.from("hospital_inventory").upsert({
    blood_type: bloodType,
    hospital_id: existing.hospital_id,
    units_available: (current?.units_available ?? 0) + 1,
    updated_at: new Date().toISOString()
  }, { onConflict: "hospital_id,blood_type" });
  if (inventoryError) throw supabaseError("Não foi possível atualizar o inventário", inventoryError);
  const { error: movementError } = await db.from("inventory_movements").insert({
    blood_type: bloodType,
    created_by: createdBy,
    hospital_id: existing.hospital_id,
    movement_type: "donation_received",
    note: "Doação concluída no fluxo piloto.",
    units: 1
  });
  if (movementError) throw supabaseError("Não foi possível registar movimento de inventário", movementError);
}

async function rewardOnce(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  responseId: string,
  donorId: string,
  points: number,
  reason: string,
  flag: "reward_arrived_at" | "reward_completed_at"
) {
  const { data } = await db.from("donor_responses").select(flag).eq("id", responseId).maybeSingle();
  const row = data as Record<string, string | null> | null;
  if (row?.[flag]) return;
  await db.from("rewards").insert({ donor_id: donorId, points, reason, tier: tierFor(points) });
  await db.from("donor_responses").update({ [flag]: new Date().toISOString() }).eq("id", responseId);
}

async function updateCooldown(db: Awaited<ReturnType<typeof createRouteSupabase>>, donorId: string) {
  const { data } = await db.from("donors").select("gender").eq("id", donorId).maybeSingle();
  const days = data?.gender === "Feminino" ? 120 : 90;
  const next = new Date();
  next.setDate(next.getDate() + days);
  await db.from("donors").update({
    available: false,
    eligibility_status: "Suspenso",
    last_donation_date: new Date().toISOString().slice(0, 10),
    next_eligible_donation_date: next.toISOString()
  }).eq("id", donorId);
}

async function currentInventory(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  hospitalId: string,
  bloodType: string
) {
  const { data, error } = await db
    .from("hospital_inventory")
    .select("units_available")
    .eq("hospital_id", hospitalId)
    .eq("blood_type", bloodType)
    .maybeSingle();
  if (error) throw supabaseError("Não foi possível carregar o inventário", error);
  return data as { units_available?: number | null } | null;
}

function requestBloodType(row: { blood_requests?: unknown }) {
  const request = Array.isArray(row.blood_requests) ? row.blood_requests[0] : row.blood_requests;
  return (request as { blood_type?: string | null } | undefined)?.blood_type ?? undefined;
}

function tierFor(points: number) {
  if (points >= 120) return "Ouro";
  if (points >= 40) return "Prata";
  return "Bronze";
}

async function notifyDonor(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  donorId: string,
  status: ResponseStatus
) {
  const { data } = await db.from("donors").select("user_id").eq("id", donorId).maybeSingle();
  await notifyUser(db, {
    message: workflowMessage(status),
    publicUserId: data?.user_id,
    role: "donor",
    title: workflowTitle(status),
    type: status
  });
}

async function syncRequest(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  requestId: string,
  status: ResponseStatus
) {
  const { error } = await db.rpc("recompute_request_quota", { p_request_id: requestId });
  if (error) throw supabaseError("Não foi possível atualizar o pedido de sangue", error);
}

async function syncAcceptance(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  existing: { blood_request_id: string; donor_id: string },
  status: ResponseStatus
) {
  const payload = {
    arrived_at: status === "Chegou" || status === "PIN Validado" ? new Date().toISOString() : undefined,
    cancelled_at: status === "Cancelado" || status === "Não Compareceu" ? new Date().toISOString() : undefined,
    completed_at: status === "Doação concluída" ? new Date().toISOString() : undefined,
    status: acceptanceStatus(status),
    updated_at: new Date().toISOString()
  };
  await db.from("request_acceptances")
    .update(payload)
    .eq("request_id", existing.blood_request_id)
    .eq("donor_id", existing.donor_id);
}

function supabaseError(label: string, error: { message: string }) {
  return new Error(`${label}. ${error.message}`);
}
