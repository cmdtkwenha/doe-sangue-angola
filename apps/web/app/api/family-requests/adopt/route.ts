import { auditApiAction } from "../../_utils/audit";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertString } from "../../_utils/validation";
import { requestColumns } from "../../blood-requests/columns";

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ id: string }>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const hospitalId = assertString(principal.hospitalId, "Hospital");
    requireEntityAccess(principal, "hospital", hospitalId);
    const db = await createRouteSupabase();
    const id = assertString(body.id, "Pedido familiar");
    const { data: family, error } = await db.from("family_emergency_requests").select("*").eq("id", id).single();
    if (error) throw new Error(`family_emergency_requests select: ${error.message}`);
    if (!["Aprovado", "Ativo"].includes(family.status)) {
      throw new ApiError(409, "Pedido familiar ainda não aprovado para adoção.");
    }
    if (family.blood_request_id) return family;
    const { data, error: requestError } = await db.from("blood_requests").insert({
      blood_type: family.blood_type,
      created_by: principal.authUserId,
      family_request_id: family.id,
      hospital_id: hospitalId,
      municipality: family.municipality,
      notes: `Pedido Familiar adotado: ${family.patient_name}. Contacto: ${family.contact_name} ${family.contact_phone}.`,
      patient_code: `FAM-${family.id.slice(0, 8)}`,
      province: family.province,
      request_source: "family",
      status: "Aberto",
      units: family.units_needed,
      units_needed: family.units_needed,
      urgency: family.urgency
    }).select(requestColumns).single();
    if (requestError) throw new Error(`blood_requests insert family adopt: ${requestError.message}`);
    const created = data as unknown as { id: string };
    await db.from("family_emergency_requests").update({
      blood_request_id: created.id,
      hospital_id: hospitalId,
      status: "Ativo",
      updated_at: new Date().toISOString()
    }).eq("id", id);
    await auditApiAction(principal, `Adotou pedido familiar ${id}.`);
    return data;
  });
}
