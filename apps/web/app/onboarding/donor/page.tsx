import { RouteGuard } from "../../components/auth/RouteGuard";
import { DonorOnboarding } from "../../components/onboarding";

export default function DonorOnboardingPage() {
  return (
    <RouteGuard allowed={["donor"]}>
      <DonorOnboarding />
    </RouteGuard>
  );
}
