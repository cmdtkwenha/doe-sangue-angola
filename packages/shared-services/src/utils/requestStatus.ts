import type { RequestStatus } from "@doe-sangue-angola/shared-types";

export function normalizeRequestStatus(status: string): RequestStatus {
  if (status === "OPEN") return "Aberto";
  if (status === "FULFILLED") return "Pedido preenchido";
  if (status === "COMPLETED") return "Concluído";
  if (status === "CANCELLED") return "Cancelado";
  if (status === "Triagem") return "Em Correspondência";
  if (status === "Concluido") return "Concluído";
  return status as RequestStatus;
}

export function getRequestStatusLabel(status: string) {
  return normalizeRequestStatus(status);
}

export function isCompletedRequest(status: string) {
  const normalized = normalizeRequestStatus(status);
  return normalized === "Concluído" || normalized === "Cancelado";
}
