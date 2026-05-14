import { RouteGuard } from "../../components/auth/RouteGuard";
import { SettingsShell } from "../../components/settings";

export default function DonorSettingsPage() {
  return (
    <RouteGuard allowed={["donor"]}>
      <SettingsShell role="donor" />
    </RouteGuard>
  );
}
