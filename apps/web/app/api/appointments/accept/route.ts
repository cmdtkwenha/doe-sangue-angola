import type { Appointment } from "@doe-sangue-angola/shared-types";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireSameOrigin } from "../../_utils/security";
import { assertString } from "../../_utils/validation";

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ donorId: string; requestId: string }>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["donor", "admin"]);
    const donorId = assertString(body.donorId, "Dador");
    const db = await createRouteSupabase();
    const { data: donor, error } = await db
      .from("donors")
      .select("id,user_id")
      .eq("id", donorId)
      .maybeSingle();
    if (error) throw supabaseError("Não foi possível carregar o dador", error);
    const donorRow = donor as unknown as { id: string; user_id?: string } | null;
    if (!donorRow?.id) throw new ApiError(404, "Perfil de dador não encontrado.");
    if (
      principal.role !== "admin" &&
      donorRow.user_id !== principal.authUserId &&
      principal.donorId !== donorId
    ) {
      throw new ApiError(403, "Acesso negado a este dador.");
    }
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
      throw new ApiError(409, "Este pedido já não está disponível.");
    }
    const pin = createPin();
    const response = await createDonorResponse(db, donorId, requestRow.id, requestRow.hospital_id, pin);
    const appointment = await createAppointment(db, donorId, requestRow.id, requestRow.hospital_id, response.confirmation_pin);
    const { error: statusError } = await db
      .from("blood_requests")
      .update({ status: "Doador a Caminho" })
      .eq("id", requestRow.id);
    if (statusError) throw supabaseError("Não foi possível atualizar o pedido de sangue", statusError);
    await auditApiAction(principal, `Aceitou pedido de sangue ${body.requestId}.`);
    return appointment;
  });
}

async function createDonorResponse(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  donorId: string,
  requestId: string,
  hospitalId: string,
  pin: string
) {
  const { data: existing, error: findError } = await db
    .from("donor_responses")
    .select("id,confirmation_pin")
    .eq("donor_id", donorId)
    .eq("blood_request_id", requestId)
    .maybeSingle();
  if (findError) throw supabaseError("Não foi possível verificar aceitação existente", findError);
  if (existing?.id) return existing;
  const { data, error } = await db
    .from("donor_responses")
    .insert({
      blood_request_id: requestId,
      confirmation_pin: pin,
      donor_id: donorId,
      eta_minutes: 15,
      hospital_id: hospitalId,
      status: "accepted"
    })
    .select("id,confirmation_pin")
    .single();
  if (error) throw supabaseError("Não foi possível aceitar o pedido", error);
  return data;
}

async function createAppointment(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  donorId: string,
  requestId: string,
  hospitalId: string,
  pin: string
): Promise<Appointment> {
  const { data: existing, error: existingError } = await db
    .from("appointments")
    .select("id,donor_id,hospital_id,blood_request_id,created_at,date,time,pin,status")
    .eq("donor_id", donorId)
    .eq("blood_request_id", requestId)
    .maybeSingle();
  if (existingError) throw supabaseError("Não foi possível verificar agendamento", existingError);
  if (existing?.id) return mapAppointment(existing);

  const when = nextAppointmentSlot();
  const { data, error } = await db
    .from("appointments")
    .insert({
      blood_request_id: requestId,
      date: when.date,
      donor_id: donorId,
      hospital_id: hospitalId,
      pin,
      status: "Pendente",
      time: when.time
    })
    .select("id,donor_id,hospital_id,blood_request_id,created_at,date,time,pin,status")
    .single();
  if (error) throw supabaseError("Não foi possível criar agendamento", error);
  return mapAppointment(data);
}

function mapAppointment(row: {
  date: string;
  donor_id: string;
  hospital_id: string;
  id: string;
  pin: string;
  status: Appointment["status"];
  time: string;
  blood_request_id?: string | null;
  created_at?: string | null;
}): Appointment {
  return {
    bloodRequestId: row.blood_request_id ?? undefined,
    createdAt: row.created_at ?? undefined,
    date: row.date,
    donorId: row.donor_id,
    hospitalId: row.hospital_id,
    id: row.id,
    pin: row.pin,
    status: row.status,
    time: row.time
  };
}

function createPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function nextAppointmentSlot() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setMinutes(0, 0, 0);
  date.setHours(Math.max(9, Math.min(16, date.getHours() + 2)));
  return {
    date: date.toISOString().slice(0, 10),
    time: date.toTimeString().slice(0, 5)
  };
}

function supabaseError(label: string, error: {
  code?: string;
  details?: string;
  message: string;
}) {
  return new Error(`${label}. ${error.message}`);
}
