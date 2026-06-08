import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";

export const activeDonorStatuses = ["Dador a Caminho", "Chegou", "PIN Validado", "PIN Gerado"];

export function normalizeStatus(status?: string | null): DonorResponseStatus {
  const oldValues: Record<string, DonorResponseStatus> = {
    accepted: "Dador a Caminho",
    Aceite: "Dador a Caminho",
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
    "Não Compareceu": "Não Compareceu",
    pin_validated: "PIN Validado",
    "PIN Gerado": "Dador a Caminho",
    "PIN Validado": "PIN Validado",
    "Dador a Caminho": "Dador a Caminho"
  };
  return oldValues[status ?? ""] ?? "Dador a Caminho";
}

export function isActiveDonorStatus(status?: string | null) {
  return activeDonorStatuses.includes(normalizeStatus(status));
}

export function ageFromBirthDate(value?: string | null) {
  if (!value) return undefined;
  const birth = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : undefined;
}

export function cleanName(name?: string | null, email?: string | null) {
  return name?.trim() || email?.trim() || "Nome não disponível";
}

export function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}
