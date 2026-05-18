import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { ReportCard } from "../../components/reports/ReportCard";
import { ReportFilters } from "../../components/reports/ReportFilters";
import { reportsByRole } from "../../components/reports/reportsData";

export default function AdminReportsPage() {
  return (
    <AdminManagementPage kicker="Gestão" title="Relatórios">
      <ReportFilters />
      <section className="grid">
        {reportsByRole.admin.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </section>
    </AdminManagementPage>
  );
}
