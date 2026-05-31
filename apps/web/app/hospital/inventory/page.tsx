import { ExpiringUnitsPanel } from "../../components/hospital/ExpiringUnitsPanel";
import { HospitalSectionPage } from "../../components/hospital/HospitalSectionPage";
import { InventoryManagementPanel } from "../../components/hospital/InventoryManagementPanel";
import { InventoryPanel } from "../../components/hospital/InventoryPanel";

export default function HospitalInventoryPage() {
  return (
    <HospitalSectionPage title="Inventário de Sangue">
      <section className="grid">
        <InventoryManagementPanel />
        <InventoryPanel />
        <ExpiringUnitsPanel />
      </section>
    </HospitalSectionPage>
  );
}
