import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { RequestsTable } from "../../components/admin/management/RequestsTable";

export default function RequestsPage() {
  return (
    <AdminManagementPage kicker="Gestão" title="Pedidos de Sangue">
      <RequestsTable />
    </AdminManagementPage>
  );
}
