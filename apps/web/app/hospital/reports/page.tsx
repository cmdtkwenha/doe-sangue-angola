import { HospitalSectionPage } from "../../components/hospital/HospitalSectionPage";
import { OperationalReports } from "../../components/reports/OperationalReports";

export default function HospitalReportsPage() {
  return (
    <HospitalSectionPage title="Relatórios">
      <OperationalReports role="hospital" />
    </HospitalSectionPage>
  );
}
