import { isRequestStatus, REQUEST_STATUS, type RequestStatus } from "@doe-sangue-angola/shared-types";

export function normalizeRequestStatus(status: string): RequestStatus {
  if (status === "OPEN") return REQUEST_STATUS.ABERTO;
  if (status === "FULFILLED") return REQUEST_STATUS.DADOR_A_CAMINHO;
  if (status === "COMPLETED") return REQUEST_STATUS.CONCLUIDO;
  if (status === "CANCELLED") return REQUEST_STATUS.CANCELADO;
  if (status === "Preenchido" || status === "Pedido preenchido") return REQUEST_STATUS.DADOR_A_CAMINHO;
  if (status === "Doador a Caminho") return REQUEST_STATUS.DADOR_A_CAMINHO;
  if (status === "Triagem" || status === "Agendado") return REQUEST_STATUS.ABERTO;
  if (status === "Concluido") return REQUEST_STATUS.CONCLUIDO;
  if (isRequestStatus(status)) return status;
  return status as RequestStatus;
}

export function getRequestStatusLabel(status: string) {
  return normalizeRequestStatus(status);
}

export function isCompletedRequest(status: string) {
  const normalized = normalizeRequestStatus(status);
  return normalized === "Concluído" || normalized === "Cancelado";
}
