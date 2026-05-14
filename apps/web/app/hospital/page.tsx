import { RouteGuard } from "../components/auth/RouteGuard";
import { HospitalPortal } from "../components/hospital/HospitalPortal";

export default function HospitalPage() {
  return (
    <RouteGuard allowed={["hospital"]}>
      <main id="conteudo-principal" tabIndex={-1}>
        <HospitalPortal />
      </main>
    </RouteGuard>
  );
}
