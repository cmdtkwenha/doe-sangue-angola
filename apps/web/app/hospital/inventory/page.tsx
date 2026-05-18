import { ExpiringUnitsPanel } from "../../components/hospital/ExpiringUnitsPanel";
import { ExpirationAlerts } from "../../components/hospital/automation/ExpirationAlerts";
import { HospitalSectionPage } from "../../components/hospital/HospitalSectionPage";
import { InventoryPanel } from "../../components/hospital/InventoryPanel";

export default function HospitalInventoryPage() {
  return (
    <HospitalSectionPage title="Inventário de Sangue">
      <section className="grid">
        <InventoryPanel />
        <ExpiringUnitsPanel />
        <ExpirationAlerts />
      </section>
    </HospitalSectionPage>
  );
}
