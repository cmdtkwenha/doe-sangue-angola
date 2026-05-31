import { AdminAnalyticsDashboard } from "../../components/admin/analytics/AdminAnalyticsDashboard";
import { AdminManagementPage } from "../../components/admin/management/AdminManagementPage";

export default function AdminAnalyticsPage() {
  return (
    <AdminManagementPage kicker="Decisão Nacional" title="Analítica Operacional">
      <AdminAnalyticsDashboard />
    </AdminManagementPage>
  );
}
