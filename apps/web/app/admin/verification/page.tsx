import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { VerificationWorkbench } from "../../components/admin/management/VerificationWorkbench";

export default function AdminVerificationPage() {
  return (
    <AdminManagementPage kicker="Operações" title="Verificação">
      <VerificationWorkbench />
    </AdminManagementPage>
  );
}
