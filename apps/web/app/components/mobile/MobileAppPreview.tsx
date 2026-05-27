"use client";

import dynamic from "next/dynamic";
import { rejectWorkflowRequest } from "@doe-sangue-angola/shared-services";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useState } from "react";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import styles from "./mobileApp.module.css";
import { DonorHome } from "./DonorHome";
import { DonorEntityGate } from "./DonorEntityGate";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { MobileShell } from "./MobileShell";
import { RequestDetailsModal } from "./RequestDetailsModal";
import { RequestList } from "./RequestList";
import { acceptRequestAction } from "../workflow/workflowActions";
import { useCurrentDonor } from "./useCurrentDonor";

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
  const [accepting, setAccepting] = useState(false);
  const [selected, setSelected] = useState<BloodRequest | null>(null);
  const [message, setMessage] = useState("Toque num pedido para ver detalhes.");
  const { data: donor } = useCurrentDonor();
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["donor_responses"]);
  const { data: responses } = useApiData<Array<{ bloodRequestId: string }>>(
    "/api/donor/responses",
    [],
    version + liveVersion
  );
  const acceptedIds = responses.map((item) => item.bloodRequestId);
  const accept = async (request: BloodRequest) => {
    if (!donor) {
      setMessage("Complete o perfil de dador antes de aceitar pedidos.");
      return;
    }
    if (acceptedIds.includes(request.id)) {
      setMessage("Este pedido já foi aceite. Veja o seu PIN no painel inicial.");
      return;
    }
    setAccepting(true);
    setMessage("A aceitar pedido...");
    try {
      const result = await acceptRequestAction(donor.id, request.id);
      setMessage(result.ok ? "Pedido aceite com sucesso. Veja o PIN no painel inicial." : result.message);
      setSelected(null);
    } finally {
      setAccepting(false);
    }
  };
  const reject = (request: BloodRequest) => {
    if (donor) rejectWorkflowRequest(donor.id, request.id);
    setMessage("Pedido recusado. Continuamos a procurar pedidos compatíveis.");
    setSelected(null);
  };

  return (
    <main className={styles.stage}>
      <DonorEntityGate>
      <section className={styles.grid}>
        <DonorHome />
        <RequestList acceptedRequestIds={acceptedIds} onAccept={accept} onOpen={setSelected} />
        <MobileShell active="requests">
          <RequestListContent />
          <p className="muted">{message}</p>
          {accepting ? <p className="muted">A criar compromisso no Supabase...</p> : null}
          <RequestDetailsModal
            onAccept={() => selected && accept(selected)}
            onClose={() => setSelected(null)}
            onReject={() => selected && reject(selected)}
            open={Boolean(selected)}
            request={selected}
          />
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
      </DonorEntityGate>
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
