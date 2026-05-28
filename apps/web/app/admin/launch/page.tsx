import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { LaunchReadinessPanel } from "../../components/admin/launch/LaunchReadinessPanel";
import { PilotDashboardSection, PilotFeedbackForm } from "../../components/pilot";
import { OperationalWalkthrough, SupportIssuesPanel } from "../../components/support";

export default function AdminLaunchPage() {
  return (
    <AdminManagementPage kicker="Piloto" title="Prontidão de Lançamento">
      <OperationalWalkthrough role="admin" />
      <PilotDashboardSection />
      <PilotFeedbackForm />
      <SupportIssuesPanel />
      <LaunchReadinessPanel />
    </AdminManagementPage>
  );
}
