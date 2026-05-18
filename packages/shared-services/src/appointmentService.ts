import { schedulingAgent } from "@doe-sangue-angola/agents";
import { appointments, donors, hospitals, requests } from "./mockStore";
import { recordAudit } from "./auditService";
import { publishRealtimeEvent } from "./realtimeService";
import { trackDonorAcceptance, trackPinValidation } from "./activityTracker";
import { trackFailedAction } from "./monitoringService";

// TODO(production): move appointment writes behind RequestRepositoryInterface.
export function acceptRequest(donorId: string, requestId: string) {
  const request = requests.find((item) => item.id === requestId);
  const donor = donors.find((item) => item.id === donorId);
  const hospital = hospitals.find((item) => item.id === request?.hospitalId);

  if (!request || !donor || !hospital) {
    trackFailedAction("Falha ao aceitar pedido", { donorId, requestId });
    return { ok: false, message: "Pedido nao encontrado." };
  }

  const existing = appointments.find((item) => item.id === `a-${donorId}-${requestId}`);
  if (existing) {
    request.status = "Agendado";
    return {
      ok: true,
      message: "Pedido já aceite. PIN existente mantido.",
      appointment: existing
    };
  }

  const appointment = schedulingAgent(donor, hospital);
  request.status = "Agendado";
  appointments.unshift({ ...appointment, id: `a-${donorId}-${requestId}` });
  recordAudit("schedulingAgent", `Gerou PIN ${appointment.pin} para ${donor.name}`);
  trackDonorAcceptance(donorId, requestId);
  publishRealtimeEvent("DONOR_ACCEPTED", { donorId, requestId });
  publishRealtimeEvent("APPOINTMENT_CREATED", { appointment });

  // Mock flow step 6: donor acceptance creates the PIN the hospital will validate.
  return {
    ok: true,
    message: "Pedido aceite. PIN gerado para validacao no hospital.",
    appointment
  };
}

export function validatePin(pin: string) {
  const appointment = appointments.find((item) => item.pin === pin);

  if (appointment) {
    appointment.status = "Confirmado";
    recordAudit("Hospital", `Validou PIN ${pin}`);
    publishRealtimeEvent("PIN_VALIDATED", { appointment, pin });
  }
  trackPinValidation(pin, Boolean(appointment));

  return {
    ok: Boolean(appointment),
    message: appointment ? "PIN validado com sucesso." : "PIN invalido.",
    appointment
  };
}

export function listAppointmentsForHospital(hospitalId: string) {
  return appointments.filter((item) => item.hospitalId === hospitalId);
}

export function listAppointmentsForDonor(donorId: string) {
  return appointments.filter((item) => item.donorId === donorId);
}
