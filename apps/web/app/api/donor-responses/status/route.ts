import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertPin, assertString, optionalString } from "../../_utils/validation";

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
      .select("id,blood_request_id,hospital_id,confirmation_pin,status")
      .eq("id", responseId)
      .single();
    if (error) throw supabaseError("Não foi possível carregar a resposta do dador", error);
    requireEntityAccess(principal, "hospital", existing.hospital_id);
    const status = normalizeActionStatus(body.status);
    if (!status || !allowed.includes(status)) throw new ApiError(400, "Estado inválido.");
    assertTransition(normalizeCurrentStatus(existing.status), status);
    if (status === "pin_validated") {
      const pin = assertPin(optionalString(body.confirmationPin, 4));
      if (pin !== existing.confirmation_pin) throw new ApiError(400, "PIN inválido.");
    }

    const payload = statusPayload(status);
    const { data, error: updateError } = await db
      .from("donor_responses")
      .update(payload)
      .eq("id", responseId)
      .select("id,status")
      .single();
    if (updateError) throw supabaseError("Não foi possível atualizar o estado do dador", updateError);
    await syncRequest(db, existing.blood_request_id, status);
    await auditApiAction(principal, `Atualizou resposta do dador para ${status}.`);
    return data;
  });
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
