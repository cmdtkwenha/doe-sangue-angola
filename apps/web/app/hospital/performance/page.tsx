import { AnalyticsGrid } from "../../components/analytics/AnalyticsGrid";
import { HospitalPerformancePanel } from "../../components/hospital/HospitalPerformancePanel";
import { HospitalSectionPage } from "../../components/hospital/HospitalSectionPage";

export default function HospitalPerformancePage() {
  return (
    <HospitalSectionPage title="Desempenho">
      <HospitalPerformancePanel />
      <AnalyticsGrid scope="hospital" />
    </HospitalSectionPage>
  );
}
