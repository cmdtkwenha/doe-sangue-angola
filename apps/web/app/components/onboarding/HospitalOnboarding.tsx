"use client";

import type { Hospital } from "@doe-sangue-angola/shared-types";
import { useApiData } from "../../hooks/useApiData";
import { useAuth } from "../auth/useAuth";
import { OnboardingShell } from "./OnboardingShell";
import styles from "./onboarding.module.css";
import { useState } from "react";

export function HospitalOnboarding() {
  const { session } = useAuth();
  const { data: hospitals, loading } = useApiData<Hospital[]>("/api/hospitals", [], 0);
  const approved = hospitals.filter((hospital) => hospital.verified);
  const [hospitalId, setHospitalId] = useState("");
  const [message, setMessage] = useState("Escolha um hospital aprovado.");

  async function save() {
    if (!session?.user.id || !hospitalId) {
      setMessage("Selecione um hospital aprovado antes de continuar.");
      return;
    }
    const response = await fetch("/api/hospitals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hospitalId, userId: session.user.id })
    });
    setMessage(response.ok ? "Conta ligada ao hospital aprovado." : "Não foi possível ligar o hospital.");
  }

  return (
    <OnboardingShell
      role="hospital"
      subtitle="Escolha o hospital aprovado antes de criar pedidos de sangue."
      title="Configurar hospital verificado"
    >
      <aside className={styles.summary}>
        <div>
          <div className="eyebrow">Lista aprovada</div>
          <h2>Hospital da conta</h2>
        </div>
        <label className="eyebrow">Hospital ou clínica</label>
        <select
          className={styles.input}
          disabled={loading}
          onChange={(event) => setHospitalId(event.target.value)}
          value={hospitalId}
        >
          <option value="">{loading ? "A carregar..." : "Selecione"}</option>
          {approved.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name} · {hospital.province}
            </option>
          ))}
        </select>
        <button className="button" onClick={save} type="button">Ligar conta</button>
        <span className="muted">{message}</span>
      </aside>
    </OnboardingShell>
  );
}
