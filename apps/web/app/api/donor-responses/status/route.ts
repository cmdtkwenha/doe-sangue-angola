import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertPin, assertString, optionalString } from "../../_utils/validation";

type ResponseStatus = "Cancelado" | "Chegou" | "Concluído" | "PIN Validado";
type StatusBody = { confirmationPin?: string; responseId: string; status: ResponseStatus };

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<StatusBody>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const db = await createRouteSupabase();
    const responseId = assertString(body.responseId, "Resposta do dador");
    const { data: existing, error } = await db
      .from("donor_responses")
      .select("id,blood_request_id,hospital_id,confirmation_pin")
      .eq("id", responseId)
      .single();
    if (error) throw supabaseError("donor_responses select", "donor_responses", error);
    requireEntityAccess(principal, "hospital", existing.hospital_id);
    if (body.status === "PIN Validado") {
      const pin = assertPin(optionalString(body.confirmationPin, 4));
      if (pin !== existing.confirmation_pin) throw new ApiError(400, "PIN inválido.");
    }
    const status = body.status;
    if (!status) throw new ApiError(400, "Estado obrigatório.");

    const payload = statusPayload(status);
    const { data, error: updateError } = await db
      .from("donor_responses")
      .update(payload)
      .eq("id", responseId)
      .select("id,status")
      .single();
    if (updateError) throw supabaseError("donor_responses update", "donor_responses", updateError);
    await syncRequest(db, existing.blood_request_id, status);
    await auditApiAction(principal, `Atualizou resposta do dador para ${status}.`);
    return data;
  });
}

function statusPayload(status: ResponseStatus) {
  return {
    arrived_at: status === "Chegou" || status === "PIN Validado" ? new Date().toISOString() : undefined,
    donation_completed_at: status === "Concluído" ? new Date().toISOString() : undefined,
    status
  };
}

async function syncRequest(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  requestId: string,
  status: ResponseStatus
) {
  const next = status === "Concluído"
    ? "Concluído"
    : status === "Cancelado"
      ? "Cancelado"
      : status === "PIN Validado"
        ? "PIN Validado"
        : "Doador a Caminho";
  const { error } = await db.from("blood_requests").update({ status: next }).eq("id", requestId);
  if (error) throw supabaseError("blood_requests update", "blood_requests", error);
}

function supabaseError(action: string, table: string, error: {
  code?: string;
  details?: string;
  message: string;
}) {
  return new Error([
    `Supabase ${action}`,
    `table=${table}`,
    `message=${error.message}`,
    error.code ? `code=${error.code}` : "",
    error.details ? `details=${error.details}` : ""
  ].filter(Boolean).join(" | "));
}
