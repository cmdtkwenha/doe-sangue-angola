"use client";

import { workflowStatuses } from "@doe-sangue-angola/shared-services";
import { useApiData } from "@hooks/useApiData";
import { useState } from "react";
import { ActionToast } from "../ui/ActionToast";
import { BloodRequestConfirmationModal, type BloodRequestConfirmation } from "../hospital/BloodRequestConfirmationModal";
import styles from "./workflow.module.css";
import { createRequestAction } from "./workflowActions";
import { useWorkflowSnapshot } from "./useWorkflowSnapshot";

export function RequestStatusTimeline() {
  const { request, hospital, refresh } = useWorkflowSnapshot();
  const active = Math.max(0, workflowStatuses.indexOf(request?.status as never));
  const [confirming, setConfirming] = useState<BloodRequestConfirmation | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "error" | "success" }>({
    message: "",
    tone: "success"
  });
  const hospitalId = hospital?.id ?? "";
  const { data: inventory } = useApiData<Array<{ bloodType: string; safeMinimum: number; units: number }>>(
    hospitalId ? `/api/hospital/inventory?hospitalId=${hospitalId}` : "/api/hospital/inventory?hospitalId=missing",
    []
  );
  const stock = inventory.find((item) => item.bloodType === "O-");

  async function confirmRequest() {
    if (!confirming || !hospital?.id) return;
    setSaving(true);
    const result = await createRequestAction({
      bloodType: confirming.bloodType,
      hospitalId: hospital.id,
      notes: confirming.notes,
      units: confirming.units,
      urgency: confirming.urgency
    });
    showToast(result.ok ? "Pedido criado e dadores notificados." : result.message ?? "Falha ao criar pedido.", result.ok ? "success" : "error");
    if (result.ok) {
      setConfirming(null);
      refresh();
    }
    setSaving(false);
  }

  function showToast(message: string, tone: "error" | "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast({ message: "", tone: "success" }), 3200);
  }

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <div>
          <div className={styles.title}>Fluxo do Pedido</div>
          <p className="muted">{hospital?.name} · {request?.bloodType} · {request?.units} bolsas</p>
        </div>
        <span className="pill red">{request?.status}</span>
      </div>
      <div className={styles.line}>
        <div className={styles.bar} style={{ width: `${((active + 1) / workflowStatuses.length) * 100}%` }} />
      </div>
      <div className={styles.timeline}>
        {workflowStatuses.map((status, index) => (
          <div className={`${styles.step} ${index < active ? styles.done : ""} ${index === active ? styles.active : ""}`} key={status}>
            <span className={styles.dot}>{index + 1}</span>
            <strong>{status}</strong>
            <small className="muted">{index <= active ? "Sincronizado" : "Pendente"}</small>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <button
          className={`${styles.button} ${styles.primary}`}
          onClick={() => setConfirming({
            bloodType: "O-",
            currentStock: stock?.units ?? 0,
            minimumStock: stock?.safeMinimum ?? 0,
            notes: "Pedido O- urgente criado pelo fluxo do pedido.",
            units: 4,
            urgency: "Critica"
          })}
          type="button"
        >
          Criar pedido O- urgente
        </button>
      </div>
      <BloodRequestConfirmationModal
        loading={saving}
        onCancel={() => !saving && setConfirming(null)}
        onConfirm={() => void confirmRequest()}
        request={confirming}
      />
      <ActionToast message={toast.message} tone={toast.tone} />
    </section>
  );
}
