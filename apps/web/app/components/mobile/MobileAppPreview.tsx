"use client";

import dynamic from "next/dynamic";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useState } from "react";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import styles from "./mobileApp.module.css";
import { DonorHome } from "./DonorHome";
import { DonorEntityGate } from "./DonorEntityGate";
import { ActionToast } from "../ui/ActionToast";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { MobileShell } from "./MobileShell";
import { RequestDetailsModal } from "./RequestDetailsModal";
import { RequestList } from "./RequestList";
import { acceptRequestAction } from "../workflow/workflowActions";
import { useCurrentDonor } from "./useCurrentDonor";
import { canDonorAcceptRequest, eligibilityState } from "./EligibilityStatusCard";
import { OnboardingCompletionTracker, OperationalWalkthrough } from "../support";

const load = (label: string) => () => <LoadingSkeleton label={label} />;
const DonationSuccessScreen = dynamic(() =>
  import("./DonationSuccessScreen").then((module) => module.DonationSuccessScreen),
{ loading: load("A carregar partilha de doação") });
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
  const [pendingAccept, setPendingAccept] = useState<BloodRequest | null>(null);
  const [optimisticAccepted, setOptimisticAccepted] = useState<string[]>([]);
  const [selected, setSelected] = useState<BloodRequest | null>(null);
  const [message, setMessage] = useState("Toque num pedido para ver detalhes.");
  const [toast, setToast] = useState<{ message: string; tone: "error" | "success" }>({
    message: "",
    tone: "success"
  });
  const { data: donor } = useCurrentDonor();
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["donor_responses", "donors"]);
  const { data: responses } = useApiData<Array<{ bloodRequestId: string }>>(
    "/api/donor/responses",
    [],
    version + liveVersion
  );
  const acceptedIds = [...new Set([...responses.map((item) => item.bloodRequestId), ...optimisticAccepted])];
  const askAccept = (request: BloodRequest) => {
    const state = eligibilityState(donor);
    if (!state.canAccept) {
      showToast(`${state.label}: ${state.reason}`, "error");
      return;
    }
    setSelected(null);
    setPendingAccept(request);
  };
  const accept = async () => {
    if (!pendingAccept) return;
    if (!donor) {
      showToast("Complete o perfil de dador antes de aceitar pedidos.", "error");
      return;
    }
    if (!canDonorAcceptRequest(donor)) {
      const state = eligibilityState(donor);
      showToast(`${state.label}: ${state.reason}`, "error");
      setPendingAccept(null);
      return;
    }
    if (acceptedIds.includes(pendingAccept.id)) {
      showToast("Este pedido já foi aceite. Veja o seu PIN no painel inicial.", "error");
      return;
    }
    setAccepting(true);
    setOptimisticAccepted((items) => [...new Set([...items, pendingAccept.id])]);
    setMessage("A aceitar pedido...");
    try {
      const result = await acceptRequestAction(donor.id, pendingAccept.id);
      const text = result.ok ? "Pedido aceite com sucesso. Veja o PIN no painel inicial." : result.message;
      setMessage(text);
      showToast(text, result.ok ? "success" : "error");
      if (result.ok) setPendingAccept(null);
      else setOptimisticAccepted((items) => items.filter((id) => id !== pendingAccept.id));
    } finally {
      setAccepting(false);
    }
  };
  const reject = (request: BloodRequest) => {
    setMessage("Pedido recusado. Continuamos a procurar pedidos compatíveis.");
    setSelected(null);
  };
  function showToast(message: string, tone: "error" | "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast({ message: "", tone: "success" }), 3200);
  }

  return (
    <main className={styles.stage}>
      <DonorEntityGate>
      <section className={styles.grid}>
        <DonorHome />
        <OperationalWalkthrough role="donor" />
        <OnboardingCompletionTracker
          title="Perfil de dador"
          items={[
            { done: Boolean(donor?.id), label: "Perfil criado" },
            { done: Boolean(donor?.bloodType), label: "Tipo sanguíneo" },
            { done: Boolean(donor?.province), label: "Província" },
            { done: Boolean(donor?.municipality), label: "Município" }
          ]}
        />
        <RequestList
          acceptedRequestIds={acceptedIds}
          acceptingRequestId={accepting ? pendingAccept?.id : undefined}
          onAccept={askAccept}
          onOpen={setSelected}
        />
        <MobileShell active="requests">
          <RequestListContent />
          <p className="muted">{message}</p>
          {accepting ? <p className="muted">A criar compromisso de doação...</p> : null}
          <RequestDetailsModal
            accepting={accepting}
            canAccept={canDonorAcceptRequest(donor)}
            onAccept={() => selected && askAccept(selected)}
            onClose={() => setSelected(null)}
            onReject={() => selected && reject(selected)}
            open={Boolean(selected)}
            request={selected}
          />
          <ConfirmationModal
            confirmLabel="Aceitar pedido"
            loading={accepting}
            message={pendingAccept ? `Confirmar aceitação do pedido ${pendingAccept.bloodType} em ${pendingAccept.hospitalName ?? "hospital selecionado"}?` : ""}
            onClose={() => !accepting && setPendingAccept(null)}
            onConfirm={() => void accept()}
            open={Boolean(pendingAccept)}
            title="Confirmar aceitação"
          />
          <ActionToast message={toast.message} tone={toast.tone} />
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
