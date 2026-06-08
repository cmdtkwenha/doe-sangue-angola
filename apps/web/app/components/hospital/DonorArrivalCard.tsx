"use client";

import { useState } from "react";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import type { AcceptedDonor } from "./incomingDonorTypes";
import { useCurrentHospital } from "./useCurrentHospital";

export function DonorArrivalCard() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["donor_responses", "blood_requests", "donors", "users"]);
  const { data: hospital } = useCurrentHospital();
  const [message, setMessage] = useState("");
  const { data: rows } = useApiData<AcceptedDonor[]>(
    hospital?.id ? "/api/hospital/accepted-donors" : "/api/appointments?hospitalId=missing",
    [],
    version + liveVersion
  );
  const donor = rows.find((row) => row.status === "Dador a Caminho" || row.status === "PIN Validado");
  const confirm = async () => {
    if (!donor) return;
    const response = await fetch("/api/donor-responses/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responseId: donor.responseId, status: "Chegou" })
    });
    const payload = await response.json().catch(() => null);
    setMessage(payload?.ok ? "Chegada confirmada." : payload?.message ?? "Não foi possível confirmar chegada.");
  };

  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Confirmações de Chegada</strong>
        <span className="pill green">Tempo real</span>
      </div>
      {!donor ? (
        <p className={base.rowMuted}>Nenhum dador aceite ainda. Aguarde a aceitação no app móvel.</p>
      ) : (
        <article className={styles.arrivalCard} key={donor.responseId}>
          <div className={styles.rowTop}>
            <strong>{donor.donorName}</strong>
            <span className="pill red">PIN {donor.pin}</span>
          </div>
          <span className={base.rowMuted}>
            {donor.donorBloodType} · ETA {donor.eta} · {donor.status}
          </span>
          <button className="button" disabled={donor.status !== "Dador a Caminho"} onClick={() => void confirm()} type="button">
            {donor.status === "Dador a Caminho" ? "Confirmar chegada" : "Chegada já registada"}
          </button>
          {message ? <span className={base.rowMuted}>{message}</span> : null}
        </article>
      )}
    </section>
  );
}
