"use client";

import {
  bloodTypes,
  validateBloodRequestDraft
} from "@doe-sangue-angola/shared-services";
import type { BloodType, Urgency } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useEffect, useState } from "react";
import { createRequestAction } from "../../workflow/workflowActions";
import { ActionToast } from "../../ui/ActionToast";
import { BloodRequestConfirmationModal, type BloodRequestConfirmation } from "../BloodRequestConfirmationModal";
import { useCurrentHospital } from "../useCurrentHospital";
import styles from "./hospitalAutomation.module.css";

export function RequestWizard() {
  const [bloodType, setBloodType] = useState<BloodType>("O-");
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: inventory } = useApiData<Array<{ bloodType: string; safeMinimum: number; status: string; units: number }>>(
    hospitalId ? `/api/hospital/inventory?hospitalId=${hospitalId}` : "/api/hospital/inventory?hospitalId=missing",
    []
  );
  const currentStock = inventory.find((item) => item.bloodType === bloodType);
  const [units, setUnits] = useState(4);
  const [urgency, setUrgency] = useState<Urgency>("Critica");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("Pronto para criar pedido.");
  const [confirming, setConfirming] = useState<BloodRequestConfirmation | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "error" | "success" }>({
    message: "",
    tone: "success"
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextBloodType = params.get("bloodType") as BloodType | null;
    const nextUrgency = params.get("urgency") as Urgency | null;
    if (nextBloodType && bloodTypes.includes(nextBloodType)) setBloodType(nextBloodType);
    if (nextUrgency && ["Desastre", "Critica", "Alta", "Media", "Normal"].includes(nextUrgency)) {
      setUrgency(nextUrgency);
    }
  }, []);

  async function confirmRequest() {
    if (!confirming || !hospital?.id) return;
    setSaving(true);
    const result = await createRequestAction({
      bloodType: confirming.bloodType,
      hospitalId: hospital.id,
      municipality: hospital.municipality,
      notes: confirming.notes,
      province: hospital.province,
      units: confirming.units,
      urgency: confirming.urgency
    });
    const text = result.ok ? "Pedido criado e dadores notificados." : result.message ?? "Falha ao criar pedido.";
    setMessage(text);
    showToast(text, result.ok ? "success" : "error");
    if (result.ok) setConfirming(null);
    setSaving(false);
  }

  function showToast(message: string, tone: "error" | "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast({ message: "", tone: "success" }), 3200);
  }

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Assistente de Pedido</strong>
        <span className="pill red">Automático</span>
      </div>
      <form className={styles.form} onSubmit={async (event) => {
        event.preventDefault();
        const hospitalId = hospital?.id ?? "";
        if (hospital?.verificationStatus !== "verified" || !hospital.verified) {
          setMessage("Apenas hospitais verificados podem criar pedidos reais.");
          return;
        }
        const validation = validateBloodRequestDraft({ bloodType, units, urgency, hospitalId });
        if (!validation.valid) {
          setMessage(validation.errors.join(" "));
          return;
        }
        setConfirming({
          bloodType,
          currentStock: currentStock?.units ?? 0,
          minimumStock: currentStock?.safeMinimum ?? 0,
          notes,
          units,
          urgency
        });
      }}>
        <select className={styles.select} onChange={(event) => setBloodType(event.target.value as BloodType)} value={bloodType}>
          {bloodTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <div className={styles.alert}>
          <strong>Stock atual {bloodType}</strong>
          <span>{currentStock?.units ?? 0} unidades disponíveis · mínimo {currentStock?.safeMinimum ?? 0}</span>
          <small className={currentStock?.status === "Crítico" ? styles.critical : styles.ok}>
            {currentStock?.status ?? "Sem stock registado"}
          </small>
        </div>
        <input className={styles.input} min={1} onChange={(event) => setUnits(Number(event.target.value))} type="number" value={units} />
        <select className={styles.select} onChange={(event) => setUrgency(event.target.value as Urgency)} value={urgency}>
          {["Desastre", "Critica", "Alta", "Media", "Normal"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <input className={styles.input} onChange={(event) => setNotes(event.target.value)} placeholder="Notas clínicas" value={notes} />
        <button className={styles.button} disabled={hospital?.verificationStatus !== "verified"} type="submit">Criar e notificar dadores</button>
      </form>
      <p className="muted">{message}</p>
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
