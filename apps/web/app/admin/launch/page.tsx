import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";
import { AdminExportTools } from "../../components/admin/launch/AdminExportTools";
import { DeploymentReadinessPanel } from "../../components/admin/launch/DeploymentReadinessPanel";
import { LaunchReadinessPanel } from "../../components/admin/launch/LaunchReadinessPanel";
import { PilotReadinessValidation } from "../../components/admin/launch/PilotReadinessValidation";
import { PilotTestingToolkit } from "../../components/admin/launch/PilotTestingToolkit";
import { PilotExecutionDashboard } from "../../components/admin/launch/PilotExecutionDashboard";
import { PilotFeedbackForm } from "../../components/pilot";
import { OperationalWalkthrough, SupportIssuesPanel } from "../../components/support";

export default function AdminLaunchPage() {
  return (
    <AdminManagementPage kicker="Piloto" title="Prontidão do Piloto">
      <PilotReadinessValidation />
      <PilotTestingToolkit />
      <OperationalWalkthrough role="admin" />
      <PilotExecutionDashboard />
      <DeploymentReadinessPanel />
      <AdminExportTools />
      <PilotFeedbackForm />
      <SupportIssuesPanel />
      <LaunchReadinessPanel />
    </AdminManagementPage>
  );
}
