import type { BloodType, Urgency } from "@doe-sangue-angola/shared-types";
import { bloodTypes } from "../constants";

const urgencies: Urgency[] = ["Desastre", "Critica", "Alta", "Media", "Normal"];

export type BloodRequestDraft = {
  bloodType: BloodType;
  hospitalId: string;
  units: number;
  urgency: Urgency;
};

export function validateBloodRequestDraft(draft: BloodRequestDraft) {
  const errors: string[] = [];

  if (!draft.hospitalId) errors.push("Hospital obrigatório.");
  if (!bloodTypes.includes(draft.bloodType)) errors.push("Tipo sanguíneo inválido.");
  if (!urgencies.includes(draft.urgency)) errors.push("Urgência inválida.");
  if (!Number.isInteger(draft.units) || draft.units < 1) {
    errors.push("Informe pelo menos 1 bolsa.");
  }

  return { valid: errors.length === 0, errors };
}
