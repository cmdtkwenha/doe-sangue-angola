import { RouteGuard } from "../../components/auth/RouteGuard";
import { ReportsShell } from "../../components/reports";

export default function HospitalReportsPage() {
  return (
    <RouteGuard allowed={["hospital"]}>
      <ReportsShell role="hospital" />
    </RouteGuard>
  );
}
