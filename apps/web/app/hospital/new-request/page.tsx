import { HospitalSectionPage } from "../../components/hospital/HospitalSectionPage";
import { RegionAlerts } from "../../components/hospital/RegionAlerts";
import { RequestWizard } from "../../components/hospital/automation/RequestWizard";

export default function HospitalNewRequestPage() {
  return (
    <HospitalSectionPage title="Solicitar Sangue">
      <section className="grid">
        <RequestWizard />
        <RegionAlerts />
      </section>
    </HospitalSectionPage>
  );
}
