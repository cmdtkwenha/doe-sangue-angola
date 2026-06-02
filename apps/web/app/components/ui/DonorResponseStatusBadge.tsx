import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";

export const donorResponseLabels: Record<DonorResponseStatus, string> = {
  "Dador a Caminho": "Dador a Caminho",
  Chegou: "Chegou",
  Cancelado: "Cancelado",
  "Doação concluída": "Doação concluída",
  "Não Compareceu": "Não compareceu",
  "PIN Validado": "PIN Validado"
};

export function normalizeDonorResponseStatus(status?: string | null): DonorResponseStatus {
  const values: Record<string, DonorResponseStatus> = {
    accepted: "Dador a Caminho",
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
    "PIN Validado": "PIN Validado",
    "Dador a Caminho": "Dador a Caminho"
  };
  return values[status ?? ""] ?? "Dador a Caminho";
}

export function canMoveDonorResponse(current: DonorResponseStatus, next: DonorResponseStatus) {
  if (next === "Cancelado") return current !== "Doação concluída" && current !== "Cancelado";
  const flow: Record<DonorResponseStatus, DonorResponseStatus[]> = {
    "Dador a Caminho": ["Chegou"],
    Chegou: ["PIN Validado"],
    Cancelado: [],
    "Doação concluída": [],
    "Não Compareceu": [],
    "PIN Validado": ["Doação concluída"]
  };
  return flow[current].includes(next);
}

export function DonorResponseStatusBadge({ status }: { status?: string | null }) {
  const normalized = normalizeDonorResponseStatus(status);
  const tone = normalized === "Doação concluída"
    ? "pill green"
    : normalized === "Cancelado" || normalized === "Não Compareceu"
      ? "pill red"
      : "pill gold";
  return <span className={tone}>{donorResponseLabels[normalized]}</span>;
}
