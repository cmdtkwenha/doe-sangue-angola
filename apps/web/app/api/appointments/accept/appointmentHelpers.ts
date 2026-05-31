import type { Appointment } from "@doe-sangue-angola/shared-types";
import type { createRouteSupabase } from "../../_utils/security";

type Db = Awaited<ReturnType<typeof createRouteSupabase>>;

export async function createAppointment(
  db: Db,
  donorId: string,
  requestId: string,
  hospitalId: string,
  pin: string,
  supabaseError: (label: string, error: { message: string }) => Error
): Promise<Appointment> {
  const columns = "id,donor_id,hospital_id,blood_request_id,created_at,date,time,pin,status";
  const { data: existing, error: existingError } = await db
    .from("appointments")
    .select(columns)
    .eq("donor_id", donorId)
    .eq("blood_request_id", requestId)
    .maybeSingle();
  if (existingError) throw supabaseError("Não foi possível verificar agendamento", existingError);
  if (existing?.id) {
    if (existing.pin !== pin) {
      const { data: updated, error } = await db
        .from("appointments")
        .update({ pin })
        .eq("id", existing.id)
        .select(columns)
        .single();
      if (error) throw supabaseError("Não foi possível sincronizar o PIN", error);
      return mapAppointment(updated);
    }
    return mapAppointment(existing);
  }

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
    .select(columns)
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
