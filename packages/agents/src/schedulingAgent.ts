import type { Appointment, Donor, Hospital } from "@doe-sangue-angola/shared-types";

export function schedulingAgent(donor: Donor, hospital: Hospital): Appointment {
  if (!donor?.id || !hospital?.id) {
    throw new Error("Perfil ainda não configurado.");
  }

  return {
    id: `appt-${donor.id}-${hospital.id}`,
    donorId: donor.id,
    hospitalId: hospital.id,
    date: "2026-05-12",
    time: hospital.capacity > 50 ? "09:30" : "11:00",
    pin: createPin(donor.id, hospital.id),
    status: "Pendente"
  };
}

function createPin(donorId: string, hospitalId: string) {
  const seed = `${donorId}${hospitalId}`.split("");
  const total = seed.reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return String(total).padStart(4, "0").slice(-4);
}
