import type { BloodRequest } from "@doe-sangue-angola/shared-types";

export function familyRequestAgent(request: BloodRequest) {
  const shareText =
    `A familia do paciente ${request.patientCode} precisa de ${request.units}` +
    ` unidade(s) de sangue ${request.bloodType}.`;

  return {
    shareText,
    canSharePublicly: request.status !== "Concluído"
  };
}
