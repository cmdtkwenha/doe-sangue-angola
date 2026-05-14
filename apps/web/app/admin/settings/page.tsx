import { RouteGuard } from "../../components/auth/RouteGuard";
import { SettingsShell } from "../../components/settings";

export default function AdminSettingsPage() {
  return (
    <RouteGuard allowed={["admin"]}>
      <SettingsShell role="admin" />
    </RouteGuard>
  );
}
