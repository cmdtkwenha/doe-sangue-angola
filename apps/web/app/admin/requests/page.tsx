import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { FamilyRequestsReview } from "../../components/admin/management/FamilyRequestsReview";
import { RequestsTable } from "../../components/admin/management/RequestsTable";

export default function RequestsPage() {
  return (
    <AdminManagementPage kicker="Gestão" title="Pedidos de Sangue">
      <FamilyRequestsReview />
      <RequestsTable />
    </AdminManagementPage>
  );
}
