import { mapAppointment, type AppointmentRow } from "@doe-sangue-angola/shared-services";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { createRouteSupabase, requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertPin, optionalString } from "../../_utils/validation";

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{ pin: string; requestId?: string }>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["hospital", "admin"]);
    const requestId = optionalString(body.requestId, 80);
    const db = await createRouteSupabase();
    const pin = assertPin(body.pin);
    let query = db
      .from("appointments")
      .update({ status: "PIN Validado" })
      .eq("pin", pin)
      .select(appointmentColumns);
    if (requestId) query = query.eq("blood_request_id", requestId);
    const { data, error } = await query.single();
    if (error) throw error;
    const appointment = mapAppointment(data as unknown as AppointmentRow);
    requireEntityAccess(principal, "hospital", appointment.hospitalId);
    if (appointment.bloodRequestId) {
      const { error: requestError } = await db
        .from("blood_requests")
        .update({ status: "PIN Validado" })
        .eq("id", appointment.bloodRequestId);
      if (requestError) throw requestError;
    }
    await auditApiAction(principal, `Validou PIN do pedido ${body.requestId ?? appointment.id}.`);
    return appointment;
  });
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
