import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { FraudReviewTable } from "../../components/admin/management/FraudReviewTable";

export default function FraudPage() {
  return (
    <AdminManagementPage kicker="Gestão" title="Revisões de Fraude">
      <FraudReviewTable />
    </AdminManagementPage>
  );
}
