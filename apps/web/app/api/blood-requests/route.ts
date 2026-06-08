import {
  dataProvider,
  mapDonor,
  mapRequest,
  requestRepository,
  type DonorRow,
  type RequestRow,
  type CreateRequestInput
} from "@doe-sangue-angola/shared-services";
import { canDonorDonateToRequest, matchingAgent } from "@doe-sangue-angola/agents";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { auditApiAction } from "../_utils/audit";
import { ApiError, apiResponse, readJson } from "../_utils/apiResponse";
import { notifyAdmins } from "../_utils/notifications";
import { notifyMatchedDonors } from "../_utils/requestNotifications";
import { assertTableRateLimit } from "../_utils/rateLimit";
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
import { donorColumns, requestColumns } from "./columns";
import { donorBlocked } from "../_utils/donorEligibility";
import { acceptedRequestIds } from "./acceptedRequestIds";

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const params = new URL(request.url).searchParams;
    const donorId = params.get("donorId");
    const hospitalId = params.get("hospitalId");
    const scope = params.get("scope") ?? "active";
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
      if (donorBlocked(donorRow)) return [];
      const acceptedIds = await acceptedRequestIds(db, donorId);
      const { data, error } = await db
        .from("blood_requests")
        .select(requestColumns)
        .order("created_at", { ascending: false });
      if (error) throw new Error(formatSupabaseError(error));
      const donorRecord = mapDonor(donorRow);
      return (data as unknown as RequestRow[])
        .map((item) => enrichRequest(item, donorRecord))
        .filter((item) => item.status === "Aberto")
        .filter((item) => !acceptedIds.has(item.id))
        .filter((item) => item.remainingSlots == null || item.remainingSlots > 0)
        .filter((item) => nearDonor(item, donorRecord))
        .filter((item) => canDonorDonateToRequest(donorRecord.bloodType, item.bloodType))
        .filter((item) =>
          matchingAgent(item, [donorRecord]).some((match) =>
            match.donor.id === donorRecord.id && match.score >= 55
          )
        )
        .sort((a, b) => (a.etaMinutes ?? 999) - (b.etaMinutes ?? 999));
    }

    if (hospitalId) {
      requireEntityAccess(principal, "hospital", hospitalId);
      const { data, error } = await db
        .from("blood_requests")
        .select(requestColumns)
        .eq("hospital_id", hospitalId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(formatSupabaseError(error));
      return (data as unknown as RequestRow[])
        .map(mapRequest)
        .filter((item) => scope === "all" || !["Concluído", "Cancelado"].includes(item.status));
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
      .select("id,province,municipality,verified,verification_status,rejection_reason")
      .eq("id", hospitalId)
      .single();
    if (hospitalError) throw new Error(formatSupabaseError(hospitalError));
    assertHospitalCanRequest(hospital);
    await assertTableRateLimit(db, {
      column: "hospital_id",
      label: "Muitos pedidos criados por este hospital",
      max: 12,
      minutes: 10,
      table: "blood_requests",
      value: hospitalId
    });

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
        accepted_count: 0,
        remaining_slots: input.units,
        status: "Aberto",
        units: input.units,
        units_needed: input.units,
        urgency: input.urgency
      })
      .select(requestColumns)
      .single();
    if (error) throw new Error(formatSupabaseError(error));

    const requestRecord = mapRequest(data as unknown as RequestRow);
    await notifyMatchedDonors(db, requestRecord, donorColumns);
    if (requestRecord.urgency === "Critica" || requestRecord.urgency === "Desastre") {
      await notifyAdmins(
        db,
        requestRecord.urgency === "Desastre" ? "Modo desastre ativado" : "Pedido crítico criado",
        `Pedido ${requestRecord.bloodType} em ${requestRecord.municipality}, ${requestRecord.province}.`,
        "critical"
      );
    }
    await auditApiAction(principal, `Criou pedido de sangue ${requestRecord.bloodType} (${requestRecord.id}).`);
    return { matches: [], request: requestRecord };
  });
}

function assertHospitalCanRequest(hospital: {
  rejection_reason?: string | null;
  verification_status?: string | null;
  verified?: boolean | null;
}) {
  const status = hospital.verification_status ?? (hospital.verified ? "Verificado" : "Pendente");
  if ((status === "Verificado" || status === "verified") && hospital.verified !== false) return;
  const labels: Record<string, string> = {
    pending: "Conta em revisão. Aguarde aprovação do Admin para criar pedidos reais.",
    Pendente: "Conta em revisão. Aguarde aprovação do Admin para criar pedidos reais.",
    rejected: `Conta rejeitada. ${hospital.rejection_reason ?? "Contacte o suporte."}`,
    Rejeitado: `Conta rejeitada. ${hospital.rejection_reason ?? "Contacte o suporte."}`,
    suspended: "Conta suspensa. Contacte o suporte antes de criar pedidos.",
    Suspenso: "Conta suspensa. Contacte o suporte antes de criar pedidos."
  };
  throw new ApiError(403, labels[status] ?? "Hospital não aprovado para criar pedidos.");
}

function enrichRequest(row: RequestRow, donor: ReturnType<typeof mapDonor>) {
  const request = mapRequest(row);
  return {
    ...request,
    etaMinutes: undefined
  };
}

function nearDonor(request: BloodRequest, donor: ReturnType<typeof mapDonor>) {
  if (request.distanceKm != null) return request.distanceKm <= 80;
  if (request.urgency === "Desastre") return true;
  return request.province === donor.province
    && (!request.municipality || request.municipality === donor.municipality || request.urgency === "Critica");
}

function formatSupabaseError(error: {
  code?: string;
  details?: string;
  hint?: string;
  message: string;
}) {
  return error.message;
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
