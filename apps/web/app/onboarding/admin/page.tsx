import { RouteGuard } from "../../components/auth/RouteGuard";
import { AdminOnboarding } from "../../components/onboarding";

export default function AdminOnboardingPage() {
  return (
    <RouteGuard allowed={["admin"]}>
      <AdminOnboarding />
    </RouteGuard>
  );
}
