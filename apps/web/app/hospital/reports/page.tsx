import { ReportCard } from "../../components/reports/ReportCard";
import { ReportFilters } from "../../components/reports/ReportFilters";
import { reportsByRole } from "../../components/reports/reportsData";
import { HospitalSectionPage } from "../../components/hospital/HospitalSectionPage";

export default function HospitalReportsPage() {
  return (
    <HospitalSectionPage title="Relatórios">
      <ReportFilters />
      <section className="grid">
        {reportsByRole.hospital.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </section>
    </HospitalSectionPage>
  );
}
