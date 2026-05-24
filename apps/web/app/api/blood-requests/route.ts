import {
  dataProvider,
  mapRequest,
  requestRepository,
  type RequestRow,
  type CreateRequestInput
} from "@doe-sangue-angola/shared-services";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { auditApiAction } from "../_utils/audit";
import { ApiError, apiResponse, readJson } from "../_utils/apiResponse";
import {
  createRouteSupabase,
  requireApiSession,
  requireEntityAccess,
  requireSameOrigin
} from "../_utils/security";
import {
  assertBloodType,
  assertStatus,
  assertString,
  assertUnits,
  assertUrgency,
  optionalString
} from "../_utils/validation";

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const params = new URL(request.url).searchParams;
    const donorId = params.get("donorId");
    const hospitalId = params.get("hospitalId");

    if (donorId === "missing" || hospitalId === "missing") return [];
    if (donorId) {
      requireEntityAccess(principal, "donor", donorId);
      return dataProvider.listRequestsForDonor(donorId);
    }

    if (hospitalId) {
      requireEntityAccess(principal, "hospital", hospitalId);
      return dataProvider.listRequestsForHospital(hospitalId);
    }

    if (principal.role !== "admin") throw new ApiError(403, "Acesso restrito ao admin.");
    return dataProvider.listRequests();
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<CreateRequestInput>(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const hospitalId = assertString(body.hospitalId ?? principal.hospitalId, "Hospital");
    requireEntityAccess(principal, "hospital", hospitalId);
    const db = await createRouteSupabase();
    const { data: hospital, error: hospitalError } = await db
      .from("hospitals")
      .select("id,province,municipality")
      .eq("id", hospitalId)
      .single();
    if (hospitalError) throw new Error(formatSupabaseError(hospitalError));

    const input = {
      bloodType: assertBloodType(body.bloodType),
      createdBy: principal.authUserId,
      hospitalId,
      municipality: optionalString(body.municipality, 120) ?? hospital.municipality,
      notes: optionalString(body.notes, 500),
      patientCode: optionalString(body.patientCode, 80) ?? `REQ-${Date.now()}`,
      province: optionalString(body.province, 120) ?? hospital.province,
      units: assertUnits(body.units),
      urgency: assertUrgency(body.urgency)
    };
    const { data, error } = await db
      .from("blood_requests")
      .insert({
        blood_type: input.bloodType,
        created_by: input.createdBy,
        hospital_id: input.hospitalId,
        municipality: input.municipality,
        notes: input.notes,
        patient_code: input.patientCode,
        province: input.province,
        status: "Aberto",
        units: input.units,
        units_needed: input.units,
        urgency: input.urgency
      })
      .select([
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
      ].join(","))
      .single();
    if (error) throw new Error(formatSupabaseError(error));

    const requestRecord = mapRequest(data as unknown as RequestRow);
    await auditApiAction(principal, `Criou pedido de sangue ${requestRecord.bloodType} (${requestRecord.id}).`);
    return { matches: [], request: requestRecord };
  });
}

function formatSupabaseError(error: {
  code?: string;
  details?: string;
  hint?: string;
  message: string;
}) {
  return [
    error.message,
    error.code ? `Código: ${error.code}` : "",
    error.details ? `Detalhes: ${error.details}` : "",
    error.hint ? `Sugestão: ${error.hint}` : ""
  ].filter(Boolean).join(" | ");
}

export async function PUT(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<
    Partial<CreateRequestInput> & { requestId: string; status?: BloodRequest["status"] }
  >(request);
  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const requestId = assertString(body.requestId, "Pedido");
    const requests = await dataProvider.listRequests() as BloodRequest[];
    const existing = requests.find((item) => item.id === requestId);
    if (!existing) throw new ApiError(404, "Pedido não encontrado.");
    requireEntityAccess(principal, "hospital", existing.hospitalId);
    const updated = await requestRepository.updateRequest(requestId, {
      bloodType: body.bloodType ? assertBloodType(body.bloodType) : undefined,
      municipality: optionalString(body.municipality, 120),
      notes: optionalString(body.notes, 500),
      patientCode: optionalString(body.patientCode, 80),
      province: optionalString(body.province, 120),
      status: body.status ? assertStatus(body.status) : undefined,
      units: body.units == null ? undefined : assertUnits(body.units),
      urgency: body.urgency ? assertUrgency(body.urgency) : undefined
    });
    await auditApiAction(principal, `Atualizou pedido de sangue ${updated.id}.`);
    return updated;
  });
}
