import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { AdminExportTools } from "../../components/admin/launch/AdminExportTools";
import { DeploymentReadinessPanel } from "../../components/admin/launch/DeploymentReadinessPanel";
import { LaunchReadinessPanel } from "../../components/admin/launch/LaunchReadinessPanel";
import { PilotExecutionDashboard } from "../../components/admin/launch/PilotExecutionDashboard";
import { PilotDashboardSection, PilotFeedbackForm } from "../../components/pilot";
import { OperationalWalkthrough, SupportIssuesPanel } from "../../components/support";

export default function AdminLaunchPage() {
  return (
    <AdminManagementPage kicker="Piloto" title="Prontidão de Lançamento">
      <OperationalWalkthrough role="admin" />
      <PilotExecutionDashboard />
      <DeploymentReadinessPanel />
      <AdminExportTools />
      <PilotDashboardSection />
      <PilotFeedbackForm />
      <SupportIssuesPanel />
      <LaunchReadinessPanel />
    </AdminManagementPage>
  );
}
