import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { AdminUserManagement } from "../../components/admin/management/AdminUserManagement";

export default function AdminUsersPage() {
  return (
    <AdminManagementPage kicker="Segurança" title="Utilizadores e Acessos">
      <AdminUserManagement />
    </AdminManagementPage>
  );
}
