import {
  dataProvider,
  mapDonor,
  mapRequest,
  requestRepository,
  type DonorRow,
  type RequestRow,
  type CreateRequestInput
} from "@doe-sangue-angola/shared-services";
import { matchingAgent } from "@doe-sangue-angola/agents";
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
    const db = await createRouteSupabase();

    if (donorId === "missing" || hospitalId === "missing") return [];
    if (donorId) {
      const { data: donor, error: donorError } = await db
        .from("donors")
        .select(donorColumns)
        .eq("id", donorId)
        .maybeSingle();
      if (donorError) throw new Error(formatSupabaseError(donorError));
      const donorRow = donor as unknown as DonorRow | null;
      if (!donorRow?.id) throw new ApiError(404, "Perfil de dador não encontrado.");
      if (
        principal.role !== "admin" &&
        donorRow.user_id !== principal.authUserId &&
        principal.donorId !== donorId
      ) {
        throw new ApiError(403, "Acesso negado ao perfil do dador.");
      }
      const { data, error } = await db
        .from("blood_requests")
        .select(requestColumns)
        .order("created_at", { ascending: false });
      if (error) throw new Error(formatSupabaseError(error));
      const donorRecord = mapDonor(donorRow);
      return (data as unknown as RequestRow[])
        .map(mapRequest)
        .filter((item) => !closedStatuses.includes(item.status))
        .filter((item) => item.province === donorRecord.province)
        .filter((item) =>
          matchingAgent(item, [donorRecord]).some((match) =>
            match.donor.id === donorRecord.id && match.score >= 55
          )
        );
    }

    if (hospitalId) {
      requireEntityAccess(principal, "hospital", hospitalId);
      const { data, error } = await db
        .from("blood_requests")
        .select(requestColumns)
        .eq("hospital_id", hospitalId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(formatSupabaseError(error));
      return (data as unknown as RequestRow[]).map(mapRequest);
    }

    if (principal.role !== "admin") throw new ApiError(403, "Acesso restrito ao admin.");
    const { data, error } = await db
      .from("blood_requests")
      .select(requestColumns)
      .order("created_at", { ascending: false });
    if (error) throw new Error(formatSupabaseError(error));
    return (data as unknown as RequestRow[]).map(mapRequest);
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
      .select(requestColumns)
      .single();
    if (error) throw new Error(formatSupabaseError(error));

    const requestRecord = mapRequest(data as unknown as RequestRow);
    await auditApiAction(principal, `Criou pedido de sangue ${requestRecord.bloodType} (${requestRecord.id}).`);
    return { matches: [], request: requestRecord };
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

const donorColumns = [
  "id",
  "user_id",
  "blood_type",
  "province",
  "municipality",
  "available",
  "birth_date",
  "email",
  "eligibility_status",
  "full_name",
  "gender",
  "last_donation",
  "last_donation_date",
  "phone",
  "points",
  "preferred_hospital_id",
  "total_donations"
].join(",");

const closedStatuses = ["Agendado", "Cancelado", "Concluído", "Concluido", "Doador a Caminho", "PIN Validado"];

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
