"use client";

import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useState } from "react";
import { createRequestAction } from "../workflow/workflowActions";
import { ActionToast } from "../ui/ActionToast";
import { BloodRequestConfirmationModal, type BloodRequestConfirmation } from "./BloodRequestConfirmationModal";
import styles from "./hospitalPortal.module.css";
import { ContextualTooltip } from "../support";
import { useCurrentHospital } from "./useCurrentHospital";

export function UrgentRequestCard() {
  const [message, setMessage] = useState("Crie um pedido urgente e notifique dadores compatíveis.");
  const [confirming, setConfirming] = useState<BloodRequestConfirmation | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "error" | "success" }>({
    message: "",
    tone: "success"
  });
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: inventory } = useApiData<Array<{ bloodType: string; safeMinimum: number; units: number }>>(
    hospitalId ? `/api/hospital/inventory?hospitalId=${hospitalId}` : "/api/hospital/inventory?hospitalId=missing",
    []
  );
  const stock = inventory.find((item) => item.bloodType === "O-");

  const ask = () => {
    if (!hospital?.id) {
      setMessage("Ligue a conta a um hospital aprovado antes de criar pedidos.");
      return;
    }
    if (!isVerified(hospital.verificationStatus) || !hospital.verified) {
      setMessage("Hospital pendente de verificação.");
      return;
    }
    setConfirming({
      bloodType: "O-",
      currentStock: stock?.units ?? 0,
      minimumStock: stock?.safeMinimum ?? 0,
      notes: "Solicitação urgente com 1 clique.",
      units: 4,
      urgency: "Critica"
    });
  };

  const create = async () => {
    if (!confirming || !hospital?.id) return;
    setSaving(true);
    const result = await createRequestAction({
      bloodType: confirming.bloodType,
      hospitalId: hospital.id,
      notes: confirming.notes,
      units: confirming.units,
      urgency: confirming.urgency
    });
    const request = ("request" in result
      ? result.request
      : "data" in result ? result.data?.request : undefined) as BloodRequest | undefined;
    const text =
      request
        ? `Pedido ${request.id} criado e sincronizado.`
        : result.message ?? "Não foi possível criar o pedido.";
    setMessage(text);
    showToast(text, request ? "success" : "error");
    if (request) setConfirming(null);
    setSaving(false);
  };

  function showToast(message: string, tone: "error" | "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast({ message: "", tone: "success" }), 3200);
  }

  return (
    <article className={styles.urgent}>
      <span className={styles.bolt}>!</span>
      <div>
        <strong>Solicitação Urgente com 1 Clique</strong>
        <ContextualTooltip
          title="Pedido urgente"
          text="Use apenas quando o hospital precisa de sangue imediato e quer notificar dadores compatíveis."
        />
        <p className="muted">{message}</p>
        <button className="button" disabled={!isVerified(hospital?.verificationStatus)} onClick={ask} type="button">
          CRIAR PEDIDO URGENTE
        </button>
        <BloodRequestConfirmationModal
          loading={saving}
          onCancel={() => !saving && setConfirming(null)}
          onConfirm={() => void create()}
          request={confirming}
        />
        <ActionToast message={toast.message} tone={toast.tone} />
      </div>
    </article>
  );
}

function isVerified(status?: string) {
  return status === "Verificado" || status === "verified";
}
