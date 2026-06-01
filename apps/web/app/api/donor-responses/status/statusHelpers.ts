import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { ApiError } from "../../_utils/apiResponse";

export type ResponseStatus = Exclude<DonorResponseStatus, "accepted">;

export function workflowTitle(status: ResponseStatus) {
  const titles: Record<ResponseStatus, string> = {
    arrived: "Chegada confirmada",
    cancelled: "Pedido cancelado",
    completed: "Doação concluída",
    no_show: "Dador ausente",
    pin_validated: "PIN validado"
  };
  return titles[status];
}

export function workflowMessage(status: ResponseStatus) {
  const messages: Record<ResponseStatus, string> = {
    arrived: "O hospital marcou a sua chegada. Aguarde a validação do PIN.",
    cancelled: "A resposta ao pedido foi cancelada.",
    completed: "Obrigado. A doação foi concluída com sucesso.",
    no_show: "A resposta foi marcada como não compareceu.",
    pin_validated: "O seu PIN foi validado pelo hospital."
  };
  return messages[status];
}

export function auditMessage(status: ResponseStatus, responseId: string) {
  const actions: Record<ResponseStatus, string> = {
    arrived: "Confirmou chegada do dador",
    cancelled: "Cancelou resposta do dador",
    completed: "Concluiu doação",
    no_show: "Marcou dador como ausente",
    pin_validated: "Validou PIN do dador"
  };
  return `${actions[status]} (${responseId}).`;
}

export function normalizeActionStatus(status?: string): ResponseStatus | null {
  const oldValues: Record<string, ResponseStatus> = {
    arrived: "arrived",
    cancelled: "cancelled",
    Cancelado: "cancelled",
    Chegou: "arrived",
    completed: "completed",
    Concluido: "completed",
    "Concluído": "completed",
    no_show: "no_show",
    NO_SHOW: "no_show",
    pin_validated: "pin_validated",
    "PIN Validado": "pin_validated"
  };
  return oldValues[status ?? ""] ?? null;
}

export function normalizeCurrentStatus(status?: string): DonorResponseStatus {
  return normalizeActionStatus(status) ?? (status === "accepted" ? "accepted" : "accepted");
}

export function assertTransition(current: DonorResponseStatus, next: ResponseStatus) {
  if (current === "completed") throw new ApiError(409, "Doação já concluída.");
  if (current === "cancelled") throw new ApiError(409, "Resposta do dador já cancelada.");
  if (current === "no_show") throw new ApiError(409, "Resposta marcada como não compareceu.");
  if (next === "cancelled" || next === "no_show") return;
  const validNext: Record<DonorResponseStatus, DonorResponseStatus[]> = {
    accepted: ["arrived"],
    arrived: ["pin_validated"],
    cancelled: [],
    completed: [],
    no_show: [],
    pin_validated: ["completed"]
  };
  if (!validNext[current].includes(next)) {
    throw new ApiError(409, transitionMessage(current, next));
  }
}

export function statusPayload(status: ResponseStatus) {
  const now = new Date().toISOString();
  return {
    arrived_at: status === "arrived" || status === "pin_validated" ? now : undefined,
    cancelled_at: status === "cancelled" || status === "no_show" ? now : undefined,
    completed_at: status === "completed" ? now : undefined,
    donation_completed_at: status === "completed" ? now : undefined,
    pin_validated_at: status === "pin_validated" ? now : undefined,
    status
  };
}

export function acceptanceStatus(status: ResponseStatus) {
  const values: Record<ResponseStatus, string> = {
    arrived: "ARRIVED",
    cancelled: "CANCELLED",
    completed: "COMPLETED",
    no_show: "NO_SHOW",
    pin_validated: "ARRIVED"
  };
  return values[status];
}

function transitionMessage(current: DonorResponseStatus, next: ResponseStatus) {
  const labels: Record<DonorResponseStatus, string> = {
    accepted: "Dador a Caminho",
    arrived: "Chegou",
    cancelled: "Cancelado",
    completed: "Doação concluída",
    no_show: "Não compareceu",
    pin_validated: "PIN Validado"
  };
  return `Ação inválida: ${labels[current]} não pode passar diretamente para ${labels[next]}.`;
}
