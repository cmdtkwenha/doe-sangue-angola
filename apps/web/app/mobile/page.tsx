import { RouteGuard } from "../components/auth/RouteGuard";
import { MobileAppPreview } from "../components/mobile/MobileAppPreview";

export default function MobilePage() {
  return (
    <RouteGuard allowed={["donor"]}>
      <main id="conteudo-principal" tabIndex={-1}>
        <MobileAppPreview />
      </main>
    </RouteGuard>
  );
}
