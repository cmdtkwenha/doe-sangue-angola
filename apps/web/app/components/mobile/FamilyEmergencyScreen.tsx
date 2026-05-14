import { DonorResponsesList } from "./DonorResponsesList";
import { EmergencyCard } from "./EmergencyCard";
import { FamilyEmergencyForm } from "./FamilyEmergencyForm";
import { MobileShell } from "./MobileShell";
import { ShareEmergencyPanel } from "./ShareEmergencyPanel";

export function FamilyEmergencyScreen() {
  return (
    <MobileShell active="donations">
      <header>
        <strong>Emergência Familiar</strong>
        <p className="muted">Criar, verificar e partilhar pedido urgente.</p>
      </header>
      <FamilyEmergencyForm />
      <EmergencyCard />
      <ShareEmergencyPanel />
      <DonorResponsesList />
    </MobileShell>
  );
}
