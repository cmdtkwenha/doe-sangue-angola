import { RouteGuard } from "../../components/auth/RouteGuard";
import { DonorSettingsEditor } from "../../components/mobile/DonorSettingsEditor";

export default function DonorSettingsPage() {
  return (
    <RouteGuard allowed={["donor"]}>
      <DonorSettingsEditor />
    </RouteGuard>
  );
}
