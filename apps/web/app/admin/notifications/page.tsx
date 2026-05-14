import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { NotificationsTable } from "../../components/admin/management/NotificationsTable";

export default function NotificationsPage() {
  return (
    <AdminManagementPage kicker="Gestão" title="Notificações">
      <NotificationsTable />
    </AdminManagementPage>
  );
}
