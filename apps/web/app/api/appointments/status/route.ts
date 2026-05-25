import { mapAppointment, type AppointmentRow } from "@doe-sangue-angola/shared-services";
import type { Appointment } from "@doe-sangue-angola/shared-types";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertString } from "../../_utils/validation";

type StatusBody = {
  appointmentId: string;
  status: Appointment["status"];
};

const allowed: Appointment["status"][] = ["Cancelado", "Chegou", "PIN Validado"];

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<StatusBody>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const appointmentId = assertString(body.appointmentId, "Agendamento");
    const status = body.status;
    if (!status || !allowed.includes(status)) {
      throw new ApiError(400, "Estado de agendamento inválido.");
    }
    const db = await createRouteSupabase();
    const { data: existing, error: existingError } = await db
      .from("appointments")
      .select("id,hospital_id,blood_request_id")
      .eq("id", appointmentId)
      .single();
    if (existingError) throw existingError;
    requireEntityAccess(principal, "hospital", existing.hospital_id);

    const { data, error } = await db
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId)
      .select(appointmentColumns)
      .single();
    if (error) throw error;
    if (existing.blood_request_id) await syncRequestStatus(db, existing.blood_request_id, status);
    await auditApiAction(principal, `Atualizou agendamento ${appointmentId} para ${status}.`);
    return mapAppointment(data as unknown as AppointmentRow);
  });
}

async function syncRequestStatus(
  db: Awaited<ReturnType<typeof createRouteSupabase>>,
  requestId: string,
  status: Appointment["status"]
) {
  const requestStatus = status === "PIN Validado"
    ? "PIN Validado"
    : status === "Cancelado"
      ? "Cancelado"
      : "Doador a Caminho";
  const { error } = await db
    .from("blood_requests")
    .update({ status: requestStatus })
    .eq("id", requestId);
  if (error) throw error;
}

const appointmentColumns = [
  "id",
  "donor_id",
  "hospital_id",
  "blood_request_id",
  "created_at",
  "date",
  "time",
  "pin",
  "status"
].join(",");
