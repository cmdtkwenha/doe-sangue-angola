export const REQUEST_STATUSES = [
  "Aberto",
  "Em Correspondência",
  "Dador a Caminho",
  "PIN Validado",
  "Concluído",
  "Cancelado"
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export function isRequestStatus(value: unknown): value is RequestStatus {
  return REQUEST_STATUSES.includes(value as RequestStatus);
}
