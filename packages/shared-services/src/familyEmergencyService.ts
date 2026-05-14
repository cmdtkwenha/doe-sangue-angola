import { familyRequestAgent } from "@doe-sangue-angola/agents";
import type { BloodRequest, BloodType } from "@doe-sangue-angola/shared-types";
import { recordAudit } from "./auditService";

export type FamilyEmergencyInput = {
  bloodType: BloodType;
  hospitalLocation: string;
  units: number;
  urgencyTime: string;
  relationship: string;
  phone: string;
};

export type FamilyEmergencyStatus =
  | "Pendente"
  | "Verificado"
  | "Expirado"
  | "Resolvido";

const emergencyRequest = createFamilyEmergency({
  bloodType: "O-",
  hospitalLocation: "Hospital Geral de Luanda",
  units: 4,
  urgencyTime: "Precisa até 14:30",
  relationship: "Filha do paciente",
  phone: "+244 923 456 789"
});

export function createFamilyEmergency(input: FamilyEmergencyInput) {
  const request: BloodRequest = {
    id: "fam-240524-001",
    hospitalId: "h1",
    patientCode: "FAM-4821",
    bloodType: input.bloodType,
    units: input.units,
    urgency: "Critica",
    status: "Aberto",
    createdAt: "2026-05-12T09:15:00Z"
  };
  const agent = familyRequestAgent(request);

  recordAudit("familyRequestAgent", `Criou pedido familiar ${request.id}`);

  return {
    ...input,
    id: request.id,
    agent,
    request,
    shareLink: `https://sangueangola.ao/emergencia/${request.id}`,
    status: "Verificado" as FamilyEmergencyStatus
  };
}

export function getFamilyEmergency() {
  return emergencyRequest;
}

export function listFamilyDonorResponses() {
  return [
    ["Maria Luísa", "O-", "A caminho", "15 min"],
    ["Paulo Manuel", "O-", "Confirmou", "22 min"],
    ["Ana Isabel", "O-", "A avaliar", "32 min"]
  ];
}
