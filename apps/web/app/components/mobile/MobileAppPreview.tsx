import dynamic from "next/dynamic";
import styles from "./mobileApp.module.css";
import { DonorHome } from "./DonorHome";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { MobileShell } from "./MobileShell";
import { RequestDetailsModal } from "./RequestDetailsModal";
import { RequestList } from "./RequestList";

const load = (label: string) => () => <LoadingSkeleton label={label} />;
const DonationSuccessScreen = dynamic(() =>
  import("./DonationSuccessScreen").then((module) => module.DonationSuccessScreen),
{ loading: load("A carregar partilha de doação") });
const DonorAcceptanceFlow = dynamic(() =>
  import("../workflow/DonorAcceptanceFlow").then((module) => module.DonorAcceptanceFlow),
{ loading: load("A preparar aceitação do pedido") });
const DonorNotifications = dynamic(() =>
  import("./DonorNotifications").then((module) => module.DonorNotifications),
{ loading: load("A carregar notificações") });
const DonorProfile = dynamic(() =>
  import("./DonorProfile").then((module) => module.DonorProfile),
{ loading: load("A carregar perfil do dador") });
const DonorRewards = dynamic(() =>
  import("./DonorRewards").then((module) => module.DonorRewards),
{ loading: load("A carregar recompensas") });
const DonorTrustSafety = dynamic(() =>
  import("./DonorTrustSafety").then((module) => module.DonorTrustSafety),
{ loading: load("A carregar segurança e privacidade") });
const EligibilityChecker = dynamic(() =>
  import("./EligibilityChecker").then((module) => module.EligibilityChecker),
{ loading: load("A preparar elegibilidade") });
const FamilyEmergencyScreen = dynamic(() =>
  import("./FamilyEmergencyScreen").then((module) => module.FamilyEmergencyScreen),
{ loading: load("A carregar pedido familiar") });

export function MobileAppPreview() {
  return (
    <main className={styles.stage}>
      <section className={styles.grid}>
        <DonorHome />
        <RequestList />
        <MobileShell active="requests">
          <RequestListContent />
          <RequestDetailsModal />
          <DonorAcceptanceFlow />
        </MobileShell>
        <DonorProfile />
        <EligibilityChecker />
        <DonorRewards />
        <DonorNotifications />
        <DonorTrustSafety />
        <FamilyEmergencyScreen />
        <DonationSuccessScreen />
      </section>
    </main>
  );
}

function RequestListContent() {
  return (
    <>
      <header className={styles.header}>
        <strong>← Pedidos Disponíveis</strong>
        <span>⌯</span>
      </header>
      <p className="muted">Próximo de você · <strong>Luanda</strong></p>
    </>
  );
}
