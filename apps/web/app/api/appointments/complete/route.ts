import { mapRequest, type RequestRow } from "@doe-sangue-angola/shared-services";
import { auditApiAction } from "../../_utils/audit";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertString } from "../../_utils/validation";

type CompleteBody = {
  donorId: string;
  requestId: string;
};

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<CompleteBody>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const requestId = assertString(body.requestId, "Pedido");
    const donorId = assertString(body.donorId, "Dador");
    const db = await createRouteSupabase();
    const { data: requestRecord, error: requestError } = await db
      .from("blood_requests")
      .select(requestColumns)
      .eq("id", requestId)
      .single();
    if (requestError) throw new ApiError(404, "Pedido não encontrado.");
    const requestRow = requestRecord as unknown as RequestRow;
    requireEntityAccess(principal, "hospital", requestRow.hospital_id);
    const { error: appointmentError } = await db
      .from("appointments")
      .update({ status: "Concluido" })
      .eq("donor_id", donorId)
      .eq("blood_request_id", requestId);
    if (appointmentError) throw appointmentError;
    const { data, error } = await db
      .from("blood_requests")
      .update({ status: "Concluído" })
      .eq("id", requestId)
      .select(requestColumns)
      .single();
    if (error) throw error;
    await auditApiAction(principal, `Concluiu doação do pedido ${requestId}.`);
    return mapRequest(data as unknown as RequestRow);
  });
}

const requestColumns = [
  "id",
  "created_by",
  "hospital_id",
  "patient_code",
  "blood_type",
  "units",
  "units_needed",
  "province",
  "municipality",
  "notes",
  "urgency",
  "status",
  "created_at"
].join(",");
