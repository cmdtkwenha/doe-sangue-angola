import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { LaunchReadinessPanel } from "../../components/admin/launch/LaunchReadinessPanel";
import { PilotDashboardSection, PilotFeedbackForm } from "../../components/pilot";

export default function AdminLaunchPage() {
  return (
    <AdminManagementPage kicker="Piloto" title="Prontidão de Lançamento">
      <PilotDashboardSection />
      <PilotFeedbackForm />
      <LaunchReadinessPanel />
    </AdminManagementPage>
  );
}
