import { monitoringService, trackFailedAction } from "./monitoringService";

export function trackLoginEvent(email: string, role: string) {
  return monitoringService({
    actor: email,
    message: `Login efetuado por ${email}`,
    metadata: { role },
    status: "ok",
    type: "LOGIN"
  });
}

export function trackRequestCreation(requestId: string, hospitalId: string) {
  return monitoringService({
    actor: hospitalId,
    message: `Pedido de sangue criado: ${requestId}`,
    metadata: { hospitalId, requestId },
    status: "ok",
    type: "REQUEST_CREATED"
  });
}

export function trackDonorAcceptance(donorId: string, requestId: string) {
  return monitoringService({
    actor: donorId,
    message: `Dador aceitou pedido ${requestId}`,
    metadata: { donorId, requestId },
    status: "ok",
    type: "DONOR_ACCEPTED"
  });
}

export function trackPinValidation(pin: string, ok: boolean) {
  return monitoringService({
    message: ok ? "PIN validado com sucesso" : "Falha na validação do PIN",
    metadata: { pin: ok ? "validado" : "oculto" },
    status: ok ? "ok" : "error",
    type: "PIN_VALIDATED"
  });
}

export function trackUserAction(
  actor: string,
  action: string,
  ok = true,
  metadata?: Record<string, string | number | boolean>
) {
  if (!ok) return trackFailedAction(action, metadata);
  return monitoringService({ actor, message: action, metadata, status: "ok", type: "USER_ACTION" });
}
