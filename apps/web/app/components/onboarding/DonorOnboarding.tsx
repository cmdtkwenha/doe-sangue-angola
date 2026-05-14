import { OnboardingShell } from "./OnboardingShell";
import { OnboardingSummary } from "./OnboardingSummary";

export function DonorOnboarding() {
  return (
    <OnboardingShell
      role="donor"
      subtitle="Complete os dados essenciais para receber pedidos compatíveis e doar com segurança."
      title="Preparar perfil de dador"
    >
      <OnboardingSummary
        action="Ativar notificações mock"
        fields={[
          ["Dadora", "Maria João Santos"],
          ["Tipo sanguíneo", "O+"],
          ["Contacto emergência", "Manuel Santos"],
          ["Elegibilidade", "Triagem por completar"]
        ]}
        title="Perfil inicial"
      />
    </OnboardingShell>
  );
}
