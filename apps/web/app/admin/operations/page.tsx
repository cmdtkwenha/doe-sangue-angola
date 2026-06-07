import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { PilotOperationsDashboard } from "../../components/admin/operations/PilotOperationsDashboard";

export default function AdminOperationsPage() {
  return (
    <AdminManagementPage kicker="Operações" title="Centro Operacional do Piloto">
      <PilotOperationsDashboard />
    </AdminManagementPage>
  );
}
