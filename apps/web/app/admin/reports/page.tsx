import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { OperationalReports } from "../../components/reports/OperationalReports";

export default function AdminReportsPage() {
  return (
    <AdminManagementPage kicker="Gestão" title="Relatórios">
      <OperationalReports role="admin" />
    </AdminManagementPage>
  );
}
