import { RouteGuard } from "../../components/auth/RouteGuard";
import { SettingsShell } from "../../components/settings";

export default function HospitalSettingsPage() {
  return (
    <RouteGuard allowed={["hospital"]}>
      <SettingsShell role="hospital" />
    </RouteGuard>
  );
}
