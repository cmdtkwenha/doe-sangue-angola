import type { BloodRequest, Donor } from "@doe-sangue-angola/shared-types";

export function fraudAgent(request?: BloodRequest, donor?: Donor) {
  const flags: string[] = [];

  if (!request?.id) {
    return {
      risk: "baixo",
      flags: ["Perfil ainda não configurado."]
    };
  }

  if (request.units > 8) flags.push("Pedido acima do volume usual");
  if (request.patientCode.length < 6) flags.push("Codigo do paciente incompleto");
  if (donor && !donor.available) flags.push("Dador marcado como indisponivel");

  return {
    risk: flags.length > 1 ? "alto" : flags.length === 1 ? "medio" : "baixo",
    flags
  };
}
