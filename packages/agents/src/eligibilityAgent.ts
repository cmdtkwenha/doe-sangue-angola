export type EligibilityInput = {
  feelingSick: boolean;
  weightOk: boolean;
  recentTravel: boolean;
  medication: boolean;
  lastDonationOk: boolean;
};

export function eligibilityAgent(input: EligibilityInput) {
  const blockers = [
    input.feelingSick ? "Sintomas recentes" : "",
    !input.weightOk ? "Peso abaixo do recomendado" : "",
    input.recentTravel ? "Viagem recente requer triagem" : "",
    input.medication ? "Medicacao precisa de avaliacao" : "",
    !input.lastDonationOk ? "Intervalo desde a ultima doacao insuficiente" : ""
  ].filter(Boolean);

  return {
    eligible: blockers.length === 0,
    message:
      blockers.length === 0
        ? "Dador elegivel para doar."
        : "Dador precisa de nova avaliacao.",
    blockers
  };
}
