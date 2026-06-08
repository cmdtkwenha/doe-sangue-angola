import { canDonorDonateToRequest } from "@doe-sangue-angola/agents";
import { DONOR_ELIGIBILITY_STATUS, type BloodType } from "@doe-sangue-angola/shared-types";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";
import { donorBlocked } from "../../_utils/donorEligibility";
import { notifyHospitalUsers, notifyUser } from "../../_utils/notifications";
import { assertTableRateLimit } from "../../_utils/rateLimit";
import { assertString } from "../../_utils/validation";
import { createAppointment } from "./appointmentHelpers";

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ donorId: string; requestId: string }>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["donor", "admin"]);
    const donorId = assertString(body.donorId, "Dador");
    const db = await createRouteSupabase();
    const { data: donor, error } = await db
      .from("donors")
      .select("id,user_id,blood_type,available,eligibility_status,next_eligible_donation_date")
      .eq("id", donorId)
      .maybeSingle();
    if (error) throw supabaseError("Não foi possível carregar o dador", error);
    const donorRow = donor as unknown as {
      available?: boolean;
      blood_type?: BloodType | null;
      eligibility_status?: string | null;
      id: string;
      next_eligible_donation_date?: string | null;
      user_id?: string;
    } | null;
    if (!donorRow?.id) throw new ApiError(404, "Perfil de dador não encontrado.");
    if (
      principal.role !== "admin" &&
      donorRow.user_id !== principal.authUserId &&
      principal.donorId !== donorId
    ) {
      throw new ApiError(403, "Acesso negado a este dador.");
    }
    if (donorBlocked(donorRow)) {
      throw new ApiError(409, eligibilityBlockMessage(donorRow));
    }
    await assertTableRateLimit(db, {
      column: "donor_id",
      label: "Muitas tentativas de aceitar pedidos",
      max: 5,
      minutes: 10,
      table: "donor_responses",
      value: donorId
    });
    const requestId = assertString(body.requestId, "Pedido");
    const { data: bloodRequest, error: requestError } = await db
      .from("blood_requests")
      .select("id,hospital_id,blood_type,status,remaining_slots")
      .eq("id", requestId)
      .maybeSingle();
    if (requestError) throw supabaseError("Não foi possível carregar o pedido de sangue", requestError);
    const requestRow = bloodRequest as {
      blood_type?: BloodType | null;
      hospital_id: string;
      id: string;
      remaining_slots?: number | null;
      status: string;
    } | null;
    if (!requestRow?.id) throw new ApiError(404, "Pedido de sangue não encontrado.");
    if (!canDonorDonateToRequest(donorRow.blood_type, requestRow.blood_type)) {
      throw new ApiError(409, "Este pedido não é compatível com o seu tipo sanguíneo.");
    }
    const response = await acceptWithQuota(db, donorId, requestRow.id);
    const appointment = await createAppointment(db, donorId, requestRow.id, response.hospital_id, response.confirmation_pin, supabaseError);
    const hospital = await loadHospital(db, response.hospital_id);
    await notifyHospitalUsers(
      db,
      response.hospital_id,
      "Dador aceitou pedido",
      "Um dador compatível aceitou o pedido e está a caminho.",
      "accepted"
    );
    await notifyUser(db, {
      message: `Pedido aceite. Use o PIN ${response.confirmation_pin} no hospital.`,
      publicUserId: donorRow.user_id,
      role: "donor",
      title: "Pedido aceite com sucesso",
      type: "appointment"
    });
    await addReward(db, response.id, donorId, 25, "Pedido aceite");
    await auditApiAction(principal, `Aceitou pedido de sangue ${body.requestId}.`);
    return {
      acceptance_id: response.id,
      appointment,
      blood_type: requestRow.blood_type,
      confirmation_pin: response.confirmation_pin,
      donor_id: donorId,
      hospital: {
        id: response.hospital_id,
        municipality: hospital?.municipality ?? null,
        name: hospital?.name ?? "Hospital",
        province: hospital?.province ?? null
      },
      hospital_id: response.hospital_id,
      pin: response.confirmation_pin,
      request_id: requestRow.id,
      status: "Dador a Caminho"
    };
  });
}

async function loadHospital(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  hospitalId: string
) {
  const { data, error } = await db
    .from("hospitals")
    .select("id,name,municipality,province")
    .eq("id", hospitalId)
    .maybeSingle();
  if (error) throw supabaseError("Não foi possível carregar o hospital", error);
  return data;
}

function eligibilityBlockMessage(donor: {
  eligibility_status?: string | null;
  next_eligible_donation_date?: string | null;
}) {
  const labels: Record<string, string> = {
    [DONOR_ELIGIBILITY_STATUS.PENDENTE]: "A sua conta está pendente de verificação.",
    [DONOR_ELIGIBILITY_STATUS.INELEGIVEL]: "A sua conta está inelegível para doação.",
    [DONOR_ELIGIBILITY_STATUS.REVISAO_NECESSARIA]: "A sua conta está em revisão pela Administração Nacional.",
    [DONOR_ELIGIBILITY_STATUS.TEMPORARIAMENTE_INELEGIVEL]: "Ainda está em período de recuperação antes da próxima doação."
  };
  const status = donor.eligibility_status ?? "";
  const next = donor.next_eligible_donation_date
    ? ` Próxima data elegível: ${new Date(donor.next_eligible_donation_date).toLocaleDateString("pt-AO")}.`
    : "";
  return `${labels[status] ?? "Ainda não pode doar."}${next}`;
}

async function acceptWithQuota(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  donorId: string,
  requestId: string
) {
  const { data, error } = await db.rpc("accept_blood_request_quota", {
    p_donor_id: donorId,
    p_request_id: requestId
  });
  if (error) throw supabaseError("Não foi possível aceitar o pedido", error);
  const row = Array.isArray(data) ? data[0] : data;
  const pin = row?.confirmation_pin ?? row?.pin;
  if (!row?.response_id || !pin || !row.hospital_id) {
    throw new ApiError(500, "Aceitação não devolveu dados completos.");
  }
  return {
    confirmation_pin: pin as string,
    hospital_id: row.hospital_id as string,
    id: row.response_id as string
  };
}

async function addReward(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  responseId: string,
  donorId: string,
  points: number,
  reason: string
) {
  const { data } = await db
    .from("donor_responses")
    .select("reward_accepted_at")
    .eq("id", responseId)
    .maybeSingle();
  if (data?.reward_accepted_at) return;
  await db.from("rewards").insert({ donor_id: donorId, points, reason, tier: "Bronze" });
  await db
    .from("donor_responses")
    .update({ reward_accepted_at: new Date().toISOString() })
    .eq("id", responseId);
}

function supabaseError(label: string, error: {
  code?: string;
  details?: string;
  message: string;
}) {
  return new Error(`${label}. ${error.message}`);
}
