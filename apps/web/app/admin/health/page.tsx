import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { SystemHealthPanel } from "../../components/admin/management/SystemHealthPanel";

export default function AdminSystemHealthPage() {
  return (
    <AdminManagementPage kicker="Operações" title="Saúde do Sistema">
      <SystemHealthPanel />
    </AdminManagementPage>
  );
}
