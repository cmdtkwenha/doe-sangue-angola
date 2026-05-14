import { OnboardingShell } from "./OnboardingShell";
import { OnboardingSummary } from "./OnboardingSummary";

export function HospitalOnboarding() {
  return (
    <OnboardingShell
      role="hospital"
      subtitle="Complete o perfil clínico, envie a licença e aprenda a criar pedidos urgentes com segurança."
      title="Configurar hospital verificado"
    >
      <OnboardingSummary
        action="Carregar licença demonstrativa"
        fields={[
          ["Hospital", "Hospital Geral de Luanda"],
          ["Município", "Luanda"],
          ["Estado", "Verificação pendente"],
          ["Responsável", "Dr. João Mendes"]
        ]}
        title="Perfil do hospital"
      />
    </OnboardingShell>
  );
}
