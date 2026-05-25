import { mapAppointment, type AppointmentRow } from "@doe-sangue-angola/shared-services";
import { ApiError, apiResponse } from "../_utils/apiResponse";
import { createRouteSupabase, requireApiSession, requireEntityAccess } from "../_utils/security";

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const params = new URL(request.url).searchParams;
    const donorId = params.get("donorId");
    const hospitalId = params.get("hospitalId");
    const db = await createRouteSupabase();

    if (donorId) {
      requireEntityAccess(principal, "donor", donorId);
      const { data, error } = await db
        .from("appointments")
        .select(appointmentColumns)
        .eq("donor_id", donorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as AppointmentRow[]).map(mapAppointment);
    }

    if (hospitalId) {
      requireEntityAccess(principal, "hospital", hospitalId);
      const { data, error } = await db
        .from("appointments")
        .select(appointmentColumns)
        .eq("hospital_id", hospitalId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as AppointmentRow[]).map(mapAppointment);
    }

    if (principal.role !== "admin") throw new ApiError(403, "Lista restrita ao admin.");
    const { data, error } = await db
      .from("appointments")
      .select(appointmentColumns)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as AppointmentRow[]).map(mapAppointment);
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
