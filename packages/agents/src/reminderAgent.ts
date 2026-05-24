import type { Appointment, Donor } from "@doe-sangue-angola/shared-types";

export function reminderAgent(donor: Donor, appointment: Appointment) {
  if (!donor?.id || !appointment?.id) {
    throw new Error("Perfil ainda não configurado.");
  }

  return {
    donorId: donor.id,
    title: "Lembrete de doacao",
    body: `${donor.name}, a sua doacao esta marcada para ${appointment.date} as ${appointment.time}.`
  };
}
