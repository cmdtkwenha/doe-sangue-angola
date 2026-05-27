import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { LaunchReadinessPanel } from "../../components/admin/launch/LaunchReadinessPanel";

export default function AdminLaunchPage() {
  return (
    <AdminManagementPage kicker="Piloto" title="Prontidão de Lançamento">
      <LaunchReadinessPanel />
    </AdminManagementPage>
  );
}
