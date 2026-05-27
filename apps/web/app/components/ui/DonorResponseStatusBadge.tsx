import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";

export const donorResponseLabels: Record<DonorResponseStatus, string> = {
  accepted: "Dador a Caminho",
  arrived: "Chegou",
  cancelled: "Cancelado",
  completed: "Doação concluída",
  pin_validated: "PIN Validado"
};

export function normalizeDonorResponseStatus(status?: string | null): DonorResponseStatus {
  const values: Record<string, DonorResponseStatus> = {
    accepted: "accepted",
    arrived: "arrived",
    cancelled: "cancelled",
    Cancelado: "cancelled",
    Chegou: "arrived",
    completed: "completed",
    Concluido: "completed",
    "Concluído": "completed",
    pin_validated: "pin_validated",
    "PIN Validado": "pin_validated"
  };
  return values[status ?? ""] ?? "accepted";
}

export function canMoveDonorResponse(current: DonorResponseStatus, next: DonorResponseStatus) {
  if (next === "cancelled") return current !== "completed" && current !== "cancelled";
  const flow: Record<DonorResponseStatus, DonorResponseStatus[]> = {
    accepted: ["arrived"],
    arrived: ["pin_validated"],
    cancelled: [],
    completed: [],
    pin_validated: ["completed"]
  };
  return flow[current].includes(next);
}

export function DonorResponseStatusBadge({ status }: { status?: string | null }) {
  const normalized = normalizeDonorResponseStatus(status);
  const tone = normalized === "completed"
    ? "pill green"
    : normalized === "cancelled"
      ? "pill red"
      : "pill gold";
  return <span className={tone}>{donorResponseLabels[normalized]}</span>;
}
