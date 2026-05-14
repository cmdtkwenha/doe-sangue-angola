import type { RequestStatus } from "@doe-sangue-angola/shared-types";

export function normalizeRequestStatus(status: string): RequestStatus {
  if (status === "Triagem") return "Em Correspondência";
  if (status === "Concluido") return "Concluído";
  return status as RequestStatus;
}

export function getRequestStatusLabel(status: string) {
  return normalizeRequestStatus(status);
}

export function isCompletedRequest(status: string) {
  return normalizeRequestStatus(status) === "Concluído";
}
