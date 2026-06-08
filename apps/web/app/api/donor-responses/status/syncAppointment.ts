import type { createRouteSupabase } from "../../_utils/security";
import { acceptanceStatus, type ResponseStatus } from "./statusHelpers";

type Db = Awaited<ReturnType<typeof createRouteSupabase>>;

export async function syncAppointment(
  db: Db,
  existing: { blood_request_id: string; donor_id: string },
  status: ResponseStatus
) {
  const appointmentStatus = status === "Doação concluída" ? "Concluido" : acceptanceStatus(status);
  const { error } = await db.from("appointments")
    .update({ status: appointmentStatus })
    .eq("blood_request_id", existing.blood_request_id)
    .eq("donor_id", existing.donor_id);
  if (error) throw new Error(`Não foi possível atualizar o agendamento. ${error.message}`);
}
