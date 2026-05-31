import { RouteGuard } from "../../components/auth/RouteGuard";
import { DonorOnboarding } from "../../components/onboarding";

export default function MobileDonorOnboardingPage() {
  return (
    <RouteGuard allowed={["donor"]}>
      <DonorOnboarding />
    </RouteGuard>
  );
}
