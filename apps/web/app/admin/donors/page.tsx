import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { DonorsTable } from "../../components/admin/management/DonorsTable";

export default function DonorsPage() {
  return (
    <AdminManagementPage kicker="Gestão" title="Dadores">
      <DonorsTable />
    </AdminManagementPage>
  );
}
