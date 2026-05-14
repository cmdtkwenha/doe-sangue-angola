import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { HospitalsTable } from "../../components/admin/management/HospitalsTable";

export default function HospitalsPage() {
  return (
    <AdminManagementPage kicker="Gestão" title="Hospitais e Clínicas">
      <HospitalsTable />
    </AdminManagementPage>
  );
}
