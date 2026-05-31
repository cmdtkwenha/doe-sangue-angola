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
      .select("id,user_id,available,eligibility_status,next_eligible_donation_date")
      .eq("id", donorId)
      .maybeSingle();
    if (error) throw supabaseError("Não foi possível carregar o dador", error);
    const donorRow = donor as unknown as {
      available?: boolean;
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
      .select("id,hospital_id,status")
      .eq("id", requestId)
      .maybeSingle();
    if (requestError) throw supabaseError("Não foi possível carregar o pedido de sangue", requestError);
    const requestRow = bloodRequest as { hospital_id: string; id: string; status: string } | null;
    if (!requestRow?.id) throw new ApiError(404, "Pedido de sangue não encontrado.");
    if (["Agendado", "Cancelado", "Concluído", "Concluido", "Doador a Caminho"].includes(requestRow.status)) {
      const existing = await findDonorResponse(db, donorId, requestRow.id);
      if (!existing?.id) throw new ApiError(409, "Este pedido já não está disponível.");
      return createAppointment(db, donorId, requestRow.id, requestRow.hospital_id, existing.confirmation_pin, supabaseError);
    }
    const response = await createDonorResponse(db, donorId, requestRow.id, requestRow.hospital_id);
    const appointment = await createAppointment(db, donorId, requestRow.id, requestRow.hospital_id, response.confirmation_pin, supabaseError);
    const { error: statusError } = await db
      .from("blood_requests")
      .update({ status: "Doador a Caminho" })
      .eq("id", requestRow.id);
    if (statusError) throw supabaseError("Não foi possível atualizar o pedido de sangue", statusError);
    await notifyHospitalUsers(
      db,
      requestRow.hospital_id,
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
    return appointment;
  });
}

function eligibilityBlockMessage(donor: {
  eligibility_status?: string | null;
  next_eligible_donation_date?: string | null;
}) {
  const labels: Record<string, string> = {
    needs_review: "Elegibilidade em revisão pela equipa.",
    permanently_deferred: "Dador permanentemente diferido.",
    temporarily_deferred: "Dador temporariamente diferido."
  };
  const status = donor.eligibility_status ?? "";
  const next = donor.next_eligible_donation_date
    ? ` Próxima data elegível: ${new Date(donor.next_eligible_donation_date).toLocaleDateString("pt-AO")}.`
    : "";
  return `${labels[status] ?? "Ainda não pode doar."}${next}`;
}

async function createDonorResponse(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  donorId: string,
  requestId: string,
  hospitalId: string
) {
  const existing = await findDonorResponse(db, donorId, requestId);
  if (existing?.id) return existing;
  const pin = createPin();
  const pinExpiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
  const { data, error } = await db
    .from("donor_responses")
    .insert({
      blood_request_id: requestId,
      confirmation_pin: pin,
      donor_id: donorId,
      eta_minutes: 15,
      hospital_id: hospitalId,
      accepted_at: new Date().toISOString(),
      pin_expires_at: pinExpiresAt,
      status: "accepted"
    })
    .select("id,confirmation_pin")
    .single();
  if (error?.code === "23505") {
    const current = await findDonorResponse(db, donorId, requestId);
    if (current?.id) return current;
  }
  if (error) throw supabaseError("Não foi possível aceitar o pedido", error);
  return data;
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

async function findDonorResponse(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  donorId: string,
  requestId: string
) {
  const { data, error } = await db
    .from("donor_responses")
    .select("id,confirmation_pin")
    .eq("donor_id", donorId)
    .eq("blood_request_id", requestId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw supabaseError("Não foi possível verificar aceitação existente", error);
  return data;
}

function createPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function supabaseError(label: string, error: {
  code?: string;
  details?: string;
  message: string;
}) {
  return new Error(`${label}. ${error.message}`);
}
