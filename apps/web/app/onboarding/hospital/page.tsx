import { RouteGuard } from "../../components/auth/RouteGuard";
import { HospitalOnboarding } from "../../components/onboarding";

export default function HospitalOnboardingPage() {
  return (
    <RouteGuard allowed={["hospital"]}>
      <HospitalOnboarding />
    </RouteGuard>
  );
}
