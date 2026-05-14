import { OnboardingShell } from "./OnboardingShell";
import { OnboardingSummary } from "./OnboardingSummary";

export function AdminOnboarding() {
  return (
    <OnboardingShell
      role="admin"
      subtitle="Prepare a equipa nacional para validar instituições, acompanhar pedidos críticos e manter a plataforma segura."
      title="Bem-vindo ao comando nacional"
    >
      <OnboardingSummary
        action="Iniciar revisão guiada"
        fields={[
          ["Hospitais pendentes", "4 para verificar"],
          ["Pedidos críticos", "8 em monitorização"],
          ["Alertas de fraude", "3 em revisão"],
          ["Próxima ação", "Validar licença da Clínica Luz da Vida"]
        ]}
        title="Primeira missão recomendada"
      />
    </OnboardingShell>
  );
}
