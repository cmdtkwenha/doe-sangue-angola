import { RouteGuard } from "../../components/auth/RouteGuard";
import { ReportsShell } from "../../components/reports";

export default function AdminReportsPage() {
  return (
    <RouteGuard allowed={["admin"]}>
      <ReportsShell role="admin" />
    </RouteGuard>
  );
}
