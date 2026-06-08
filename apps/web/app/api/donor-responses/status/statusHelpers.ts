import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { ApiError } from "../../_utils/apiResponse";

export type ResponseStatus = Exclude<DonorResponseStatus, "Dador a Caminho">;

export function workflowTitle(status: ResponseStatus) {
  const titles: Record<ResponseStatus, string> = {
    Chegou: "Chegada confirmada",
    Cancelado: "Pedido cancelado",
    "Doação concluída": "Doação concluída",
    "Não Compareceu": "Dador ausente",
    "PIN Validado": "PIN validado"
  };
  return titles[status];
}

export function workflowMessage(status: ResponseStatus) {
  const messages: Record<ResponseStatus, string> = {
    Chegou: "O hospital marcou a sua chegada. Aguarde a validação do PIN.",
    Cancelado: "A resposta ao pedido foi cancelada.",
    "Doação concluída": "Obrigado. A doação foi concluída com sucesso.",
    "Não Compareceu": "A resposta foi marcada como não compareceu.",
    "PIN Validado": "O seu PIN foi validado pelo hospital."
  };
  return messages[status];
}

export function auditMessage(status: ResponseStatus, responseId: string) {
  const actions: Record<ResponseStatus, string> = {
    Chegou: "Confirmou chegada do dador",
    Cancelado: "Cancelou resposta do dador",
    "Doação concluída": "Concluiu doação",
    "Não Compareceu": "Marcou dador como ausente",
    "PIN Validado": "Validou PIN do dador"
  };
  return `${actions[status]} (${responseId}).`;
}

export function normalizeActionStatus(status?: string): ResponseStatus | null {
  const values: Record<string, ResponseStatus> = {
    arrived: "Chegou",
    cancelled: "Cancelado",
    Cancelado: "Cancelado",
    Chegou: "Chegou",
    completed: "Doação concluída",
    Concluido: "Doação concluída",
    "Concluído": "Doação concluída",
    "Doação concluída": "Doação concluída",
    no_show: "Não Compareceu",
    NO_SHOW: "Não Compareceu",
    "Não compareceu": "Não Compareceu",
    "Não Compareceu": "Não Compareceu",
    pin_validated: "PIN Validado",
    "PIN Validado": "PIN Validado"
  };
  return values[status ?? ""] ?? null;
}

export function normalizeCurrentStatus(status?: string): DonorResponseStatus {
  if (status === "accepted") return "Dador a Caminho";
  return normalizeActionStatus(status) ?? "Dador a Caminho";
}

export function assertTransition(current: DonorResponseStatus, next: ResponseStatus) {
  if (current === "Doação concluída") throw new ApiError(409, "Doação já concluída.");
  if (current === "Cancelado") throw new ApiError(409, "Resposta do dador já cancelada.");
  if (current === "Não Compareceu") throw new ApiError(409, "Resposta marcada como não compareceu.");
  if (next === "Cancelado" || next === "Não Compareceu") return;
  const validNext: Record<DonorResponseStatus, DonorResponseStatus[]> = {
    "Dador a Caminho": ["Chegou"],
    Chegou: ["PIN Validado"],
    Cancelado: [],
    "Doação concluída": [],
    "Não Compareceu": [],
    "PIN Validado": ["Doação concluída"]
  };
  if (!validNext[current].includes(next)) throw new ApiError(409, transitionMessage(current, next));
}

export function statusPayload(status: ResponseStatus) {
  const now = new Date().toISOString();
  return {
    arrived_at: status === "Chegou" || status === "PIN Validado" ? now : undefined,
    cancelled_at: status === "Cancelado" || status === "Não Compareceu" ? now : undefined,
    completed_at: status === "Doação concluída" ? now : undefined,
    donation_completed_at: status === "Doação concluída" ? now : undefined,
    pin_validated_at: status === "PIN Validado" ? now : undefined,
    status
  };
}

export function acceptanceStatus(status: ResponseStatus) {
  const values: Record<ResponseStatus, string> = {
    Chegou: "Chegou",
    Cancelado: "Cancelado",
    "Doação concluída": "Concluído",
    "Não Compareceu": "Não Compareceu",
    "PIN Validado": "PIN Validado"
  };
  return values[status];
}

function transitionMessage(current: DonorResponseStatus, next: ResponseStatus) {
  return `Ação inválida: ${current} não pode passar diretamente para ${next}.`;
}
