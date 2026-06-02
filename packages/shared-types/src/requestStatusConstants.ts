export const REQUEST_STATUS = {
  ABERTO: "Aberto",
  CANCELADO: "Cancelado",
  CONCLUIDO: "Concluído",
  DADOR_A_CAMINHO: "Dador a Caminho",
  EM_CORRESPONDENCIA: "Em Correspondência",
  PIN_VALIDADO: "PIN Validado"
} as const;

export const REQUEST_STATUSES = Object.values(REQUEST_STATUS);

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export function isRequestStatus(value: unknown): value is RequestStatus {
  return REQUEST_STATUSES.includes(value as RequestStatus);
}
