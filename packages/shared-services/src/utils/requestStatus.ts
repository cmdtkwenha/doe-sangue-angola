import type { RequestStatus } from "@doe-sangue-angola/shared-types";

export function normalizeRequestStatus(status: string): RequestStatus {
  if (status === "OPEN") return "Aberto";
  if (status === "FULFILLED") return "Dador a Caminho";
  if (status === "COMPLETED") return "Concluído";
  if (status === "CANCELLED") return "Cancelado";
  if (status === "Preenchido" || status === "Pedido preenchido") return "Dador a Caminho";
  if (status === "Doador a Caminho") return "Dador a Caminho";
  if (status === "Triagem" || status === "Em Correspondência" || status === "Agendado") return "Aberto";
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
