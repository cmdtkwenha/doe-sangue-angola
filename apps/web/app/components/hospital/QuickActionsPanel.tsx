"use client";

import { useState } from "react";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { createRequestAction } from "../workflow/workflowActions";
import { ActionToast } from "../ui/ActionToast";
import { BloodRequestConfirmationModal, type BloodRequestConfirmation } from "./BloodRequestConfirmationModal";
import { useCurrentHospital } from "./useCurrentHospital";

const quickActions = [
  ["Novo Pedido de Sangue", "Criar pedido", "red"],
  ["Pedido Urgente", "Notificar dadores agora", "gold"],
  ["Confirmar Chegada", "Validar PIN do dador", "green"],
  ["Mensagem aos Dadores", "Enviar comunicação", "black"]
] as const;

export function QuickActionsPanel() {
  const { data: hospital } = useCurrentHospital();
  const [message, setMessage] = useState("Selecione uma ação rápida.");
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

  const run = async (title: string) => {
    if (title.includes("Pedido")) {
      if (!hospital?.id) return setMessage("Associe primeiro a conta a um hospital aprovado.");
      setConfirming({
        bloodType: "O-",
        currentStock: stock?.units ?? 0,
        minimumStock: stock?.safeMinimum ?? 0,
        notes: title,
        units: 4,
        urgency: "Critica"
      });
      return;
    }
    setMessage(`${title} pronto para dados reais do hospital.`);
  };

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
    const request = ("request" in result
      ? result.request
      : "data" in result ? result.data?.request : undefined) as BloodRequest | undefined;
    const text = request ? `Pedido ${request.id} criado.` : result.message ?? "Ação não concluída.";
    setMessage(text);
    showToast(text, request ? "success" : "error");
    if (request) setConfirming(null);
    setSaving(false);
  }

  function showToast(message: string, tone: "error" | "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast({ message: "", tone: "success" }), 3200);
  }

  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Ações Rápidas</strong>
      </div>
      <div className={styles.actionGrid}>
        {quickActions.map(([title, subtitle, tone]) => (
          <button className={styles.action} key={title} onClick={() => void run(title)} type="button">
            <strong className={tone === "red" ? styles.redText : ""}>{title}</strong>
            <div className={base.rowMuted}>{subtitle}</div>
          </button>
        ))}
      </div>
      <p className={base.rowMuted}>{message}</p>
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
