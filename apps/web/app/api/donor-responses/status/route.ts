import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { notifyAdmins, notifyUser } from "../../_utils/notifications";
import { assertPin, assertString, optionalString } from "../../_utils/validation";
import { assertPinRate, clearPinFailures, recordFailedPin } from "../pinSecurity";

type ResponseStatus = Exclude<DonorResponseStatus, "accepted">;
type StatusBody = { confirmationPin?: string; responseId: string; status: string };
const allowed: ResponseStatus[] = ["arrived", "cancelled", "completed", "pin_validated"];

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<StatusBody>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const db = await createRouteSupabase();
    const responseId = assertString(body.responseId, "Resposta do dador");
    const { data: existing, error } = await db
      .from("donor_responses")
      .select("id,blood_request_id,donor_id,hospital_id,confirmation_pin,failed_pin_attempts,pin_expires_at,pin_locked_until,status")
      .eq("id", responseId)
      .single();
    if (error) throw supabaseError("Não foi possível carregar a resposta do dador", error);
    requireEntityAccess(principal, "hospital", existing.hospital_id);
    const status = normalizeActionStatus(body.status);
    if (!status || !allowed.includes(status)) throw new ApiError(400, "Estado inválido.");
    assertTransition(normalizeCurrentStatus(existing.status), status);
    if (status === "pin_validated") {
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
    if (status === "pin_validated") await clearPinFailures(db, responseId);
    await applyOperationalEffects(db, responseId, existing.donor_id, status);
    await syncRequest(db, existing.blood_request_id, status);
    await notifyDonor(db, existing.donor_id, status);
    if (status === "completed" || status === "cancelled") {
      await notifyAdmins(db, workflowTitle(status), workflowMessage(status), status);
    }
    await auditApiAction(principal, auditMessage(status, responseId));
    return data;
  });
}

async function applyOperationalEffects(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  responseId: string,
  donorId: string,
  status: ResponseStatus
) {
  if (status === "arrived") await rewardOnce(db, responseId, donorId, 40, "Chegada confirmada", "reward_arrived_at");
  if (status === "completed") {
    await rewardOnce(db, responseId, donorId, 120, "Doação concluída", "reward_completed_at");
    await updateCooldown(db, donorId);
  }
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
    last_donation_date: new Date().toISOString().slice(0, 10),
    next_eligible_donation_date: next.toISOString()
  }).eq("id", donorId);
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

function workflowTitle(status: ResponseStatus) {
  const titles: Record<ResponseStatus, string> = {
    arrived: "Chegada confirmada",
    cancelled: "Pedido cancelado",
    completed: "Doação concluída",
    pin_validated: "PIN validado"
  };
  return titles[status];
}

function workflowMessage(status: ResponseStatus) {
  const messages: Record<ResponseStatus, string> = {
    arrived: "O hospital marcou a sua chegada. Aguarde a validação do PIN.",
    cancelled: "A resposta ao pedido foi cancelada.",
    completed: "Obrigado. A doação foi concluída com sucesso.",
    pin_validated: "O seu PIN foi validado pelo hospital."
  };
  return messages[status];
}

function auditMessage(status: ResponseStatus, responseId: string) {
  const actions: Record<ResponseStatus, string> = {
    arrived: "Confirmou chegada do dador",
    cancelled: "Cancelou resposta do dador",
    completed: "Concluiu doação",
    pin_validated: "Validou PIN do dador"
  };
  return `${actions[status]} (${responseId}).`;
}

function normalizeActionStatus(status?: string): ResponseStatus | null {
  const oldValues: Record<string, ResponseStatus> = {
    arrived: "arrived",
    cancelled: "cancelled",
    Cancelado: "cancelled",
    Chegou: "arrived",
    completed: "completed",
    Concluido: "completed",
    "Concluído": "completed",
    pin_validated: "pin_validated",
    "PIN Validado": "pin_validated"
  };
  return oldValues[status ?? ""] ?? null;
}

function normalizeCurrentStatus(status?: string): DonorResponseStatus {
  return normalizeActionStatus(status) ?? (status === "accepted" ? "accepted" : "accepted");
}

function assertTransition(current: DonorResponseStatus, next: ResponseStatus) {
  if (current === "completed") throw new ApiError(409, "Doação já concluída.");
  if (current === "cancelled") throw new ApiError(409, "Resposta do dador já cancelada.");
  if (next === "cancelled") return;
  const validNext: Record<DonorResponseStatus, DonorResponseStatus[]> = {
    accepted: ["arrived"],
    arrived: ["pin_validated"],
    cancelled: [],
    completed: [],
    pin_validated: ["completed"]
  };
  if (!validNext[current].includes(next)) {
    throw new ApiError(409, transitionMessage(current, next));
  }
}

function transitionMessage(current: DonorResponseStatus, next: ResponseStatus) {
  const labels: Record<DonorResponseStatus, string> = {
    accepted: "Dador a Caminho",
    arrived: "Chegou",
    cancelled: "Cancelado",
    completed: "Doação concluída",
    pin_validated: "PIN Validado"
  };
  return `Ação inválida: ${labels[current]} não pode passar diretamente para ${labels[next]}.`;
}

function statusPayload(status: ResponseStatus) {
  const now = new Date().toISOString();
  return {
    arrived_at: status === "arrived" || status === "pin_validated" ? now : undefined,
    cancelled_at: status === "cancelled" ? now : undefined,
    completed_at: status === "completed" ? now : undefined,
    donation_completed_at: status === "completed" ? now : undefined,
    pin_validated_at: status === "pin_validated" ? now : undefined,
    status
  };
}

async function syncRequest(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  requestId: string,
  status: ResponseStatus
) {
  const next = status === "completed"
    ? "Concluído"
    : status === "cancelled"
      ? "Cancelado"
      : status === "pin_validated"
        ? "PIN Validado"
        : "Doador a Caminho";
  const { error } = await db.from("blood_requests").update({ status: next }).eq("id", requestId);
  if (error) throw supabaseError("Não foi possível atualizar o pedido de sangue", error);
}

function supabaseError(label: string, error: {
  code?: string;
  details?: string;
  message: string;
}) {
  return new Error(`${label}. ${error.message}`);
}
