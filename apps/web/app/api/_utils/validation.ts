import type { BloodType, RequestStatus, Urgency, UserRole } from "@doe-sangue-angola/shared-types";
import { ApiError } from "./apiResponse";

const bloodTypes: BloodType[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
const urgencies: Urgency[] = ["Desastre", "Critica", "Alta", "Media", "Normal"];
const statuses: RequestStatus[] = [
  "Aberto",
  "Dador a Caminho",
  "PIN Validado",
  "Concluído",
  "Cancelado"
];
const roles: UserRole[] = ["admin", "hospital", "donor", "support", "viewer"];

export function assertString(value: unknown, label: string, max = 160) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, `${label} é obrigatório.`);
  }
  if (value.length > max) throw new ApiError(400, `${label} excede o limite permitido.`);
  return value.trim();
}

export function optionalString(value: unknown, max = 500) {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string") throw new ApiError(400, "Campo inválido.");
  if (value.length > max) throw new ApiError(400, "Campo excede o limite permitido.");
  return value.trim();
}

export function assertBloodType(value: unknown) {
  if (!bloodTypes.includes(value as BloodType)) throw new ApiError(400, "Tipo sanguíneo inválido.");
  return value as BloodType;
}

export function assertUrgency(value: unknown) {
  if (!urgencies.includes(value as Urgency)) throw new ApiError(400, "Urgência inválida.");
  return value as Urgency;
}

export function assertStatus(value: unknown) {
  if (!statuses.includes(value as RequestStatus)) throw new ApiError(400, "Estado inválido.");
  return value as RequestStatus;
}

export function assertRole(value: unknown) {
  if (!roles.includes(value as UserRole)) throw new ApiError(400, "Perfil inválido.");
  return value as UserRole;
}

export function assertUnits(value: unknown) {
  const units = Number(value);
  if (!Number.isInteger(units) || units < 1 || units > 50) {
    throw new ApiError(400, "Informe entre 1 e 50 bolsas.");
  }
  return units;
}

export function assertPin(value: unknown) {
  const pin = assertString(value, "PIN", 4);
  if (!/^\d{4}$/.test(pin)) throw new ApiError(400, "PIN deve ter 4 dígitos.");
  return pin;
}
