"use client";

import { canDonorDonateToRequest } from "@doe-sangue-angola/agents";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useState } from "react";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { DonorEntityGate } from "./DonorEntityGate";
import { DonorPinCard } from "./DonorPinCard";
import { canDonorAcceptRequest, eligibilityState } from "./EligibilityStatusCard";
import { MobilePwaShell, type MobileTab } from "./MobilePwaShell";
import { HistoryScreen, HomeScreen, ProfileScreen, RequestsScreen, type DonorPin } from "./MobilePwaScreens";
import { RequestDetailsModal } from "./RequestDetailsModal";
import { useCurrentDonor } from "./useCurrentDonor";
import pwa from "./mobilePwa.module.css";
import { ActionToast } from "../ui/ActionToast";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { acceptRequestAction } from "../workflow/workflowActions";

export function MobileAppPreview() {
  const [active, setActive] = useState<MobileTab>("home");
  const [accepting, setAccepting] = useState(false);
  const [pendingAccept, setPendingAccept] = useState<BloodRequest | null>(null);
  const [optimisticAccepted, setOptimisticAccepted] = useState<string[]>([]);
  const [selected, setSelected] = useState<BloodRequest | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "error" | "success" }>({
    message: "",
    tone: "success"
  });
  const { data: donor, loading: donorLoading } = useCurrentDonor();
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["donor_responses", "blood_requests", "donors"]);
  const requestPath = donor?.id ? `/api/blood-requests?donorId=${donor.id}` : "/api/blood-requests?donorId=missing";
  const { data: requests, error: requestsError, loading: requestsLoading } =
    useApiData<BloodRequest[]>(requestPath, [], version + liveVersion);
  const { data: responses } = useApiData<DonorPin[]>("/api/donor/responses", [], version + liveVersion);
  const acceptedIds = [...new Set([...responses.map((item) => item.bloodRequestId), ...optimisticAccepted])];

  const askAccept = (request: BloodRequest) => {
    const state = eligibilityState(donor);
    if (!state.canAccept) return showToast(`${state.label}: ${state.reason}`, "error");
    if (!canDonorDonateToRequest(donor?.bloodType, request.bloodType)) {
      return showToast("Este pedido não é compatível com o seu tipo sanguíneo.", "error");
    }
    setSelected(null);
    setPendingAccept(request);
  };
  const accept = async () => {
    if (!pendingAccept || !donor) return;
    if (!canDonorAcceptRequest(donor)) {
      const state = eligibilityState(donor);
      showToast(`${state.label}: ${state.reason}`, "error");
      setPendingAccept(null);
      return;
    }
    if (!canDonorDonateToRequest(donor.bloodType, pendingAccept.bloodType)) {
      showToast("Este pedido não é compatível com o seu tipo sanguíneo.", "error");
      setPendingAccept(null);
      return;
    }
    if (acceptedIds.includes(pendingAccept.id)) {
      showToast("Este pedido já foi aceite. Veja o PIN no separador PIN.", "error");
      return;
    }
    setAccepting(true);
    setOptimisticAccepted((items) => [...new Set([...items, pendingAccept.id])]);
    try {
      const result = await acceptRequestAction(donor.id, pendingAccept.id);
      showToast(result.ok ? "Pedido aceite com sucesso. PIN gerado." : result.message, result.ok ? "success" : "error");
      if (result.ok) {
        setPendingAccept(null);
        setActive("pin");
      } else {
        setOptimisticAccepted((items) => items.filter((id) => id !== pendingAccept.id));
      }
    } finally {
      setAccepting(false);
    }
  };
  const reject = () => {
    setSelected(null);
    showToast("Pedido recusado. Continuamos a procurar pedidos compatíveis.", "success");
  };
  function showToast(message: string, tone: "error" | "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast({ message: "", tone: "success" }), 3200);
  }

  return (
    <main className={pwa.stage}>
      <DonorEntityGate>
        <MobilePwaShell active={active} onTabChange={setActive}>
          {active === "home" ? <HomeScreen donor={donor} loading={donorLoading} requests={requests} /> : null}
          {active === "requests" ? (
            <RequestsScreen
              acceptedIds={acceptedIds}
              acceptingId={accepting ? pendingAccept?.id : undefined}
              error={requestsError}
              loading={requestsLoading}
              onAccept={askAccept}
              onOpen={setSelected}
              requests={requests}
            />
          ) : null}
          {active === "pin" ? <DonorPinCard /> : null}
          {active === "history" ? <HistoryScreen responses={responses} /> : null}
          {active === "profile" ? <ProfileScreen donor={donor} loading={donorLoading} /> : null}
          <RequestDetailsModal
            accepting={accepting}
            canAccept={canDonorAcceptRequest(donor)}
            onAccept={() => selected && askAccept(selected)}
            onClose={() => setSelected(null)}
            onReject={reject}
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
        </MobilePwaShell>
      </DonorEntityGate>
    </main>
  );
}
