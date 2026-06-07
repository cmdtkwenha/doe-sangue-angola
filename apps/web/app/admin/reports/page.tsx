import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { NationalReportsDashboard } from "../../components/reports/NationalReportsDashboard";

export default function AdminReportsPage() {
  return (
    <AdminManagementPage kicker="Relatórios Nacionais" title="Relatórios e Analítica Nacional">
      <NationalReportsDashboard />
    </AdminManagementPage>
  );
}
