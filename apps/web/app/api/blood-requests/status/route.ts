import { mapRequest, type RequestRow } from "@doe-sangue-angola/shared-services";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { apiResponse, readJson } from "../../_utils/apiResponse";
import {
  createRouteSupabase,
  requireApiSession,
  requireEntityAccess,
  requireSameOrigin
} from "../../_utils/security";
import { assertStatus, assertString } from "../../_utils/validation";

type StatusBody = {
  requestId: string;
  status: BloodRequest["status"];
};

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<StatusBody>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const db = await createRouteSupabase();
    const requestId = assertString(body.requestId, "Pedido");
    const status = assertStatus(body.status ?? "Aberto");
    const { data: existing, error: existingError } = await db
      .from("blood_requests")
      .select("hospital_id")
      .eq("id", requestId)
      .single();
    if (existingError) throw existingError;
    requireEntityAccess(principal, "hospital", existing.hospital_id);
    const { data, error } = await db
      .from("blood_requests")
      .update({ status })
      .eq("id", requestId)
      .select(requestColumns)
      .single();
    if (error) throw error;
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
