import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { HealthcareImportPage } from "../../components/admin/imports/HealthcareImportPage";

export default function ImportsPage() {
  return (
    <AdminManagementPage kicker="Dados nacionais" title="Importação de Dados">
      <HealthcareImportPage />
    </AdminManagementPage>
  );
}
