"use client";

import type { Appointment } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useState } from "react";
import { EmptyState } from "../ui/EmptyState";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";
import { completeDonationAction, updateAppointmentStatusAction } from "../workflow/workflowActions";

type AcceptedDonor = {
  appointmentId: string;
  bloodRequestId?: string;
  createdAt?: string;
  donorBloodType: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  eta: string;
  pin: string;
  requestBloodType: string;
  requestStatus: string;
  status: Appointment["status"];
};

export function IncomingDonorsList() {
  const version = useRealtimeVersion();
  const [message, setMessage] = useState("Aguardando dadores aceites.");
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: rows, loading, error } = useApiData<AcceptedDonor[]>(
    hospitalId ? "/api/hospital/accepted-donors" : "/api/appointments?hospitalId=missing",
    [],
    version
  );

  async function update(row: AcceptedDonor, status: Appointment["status"]) {
    setMessage("A atualizar estado do dador...");
    const result = status === "Concluido" && row.bloodRequestId
      ? await completeDonationAction(row.donorId, row.bloodRequestId)
      : await updateAppointmentStatusAction(row.appointmentId, status);
    setMessage(result.ok ? "Estado atualizado com sucesso." : result.message);
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Dadores a Caminho</strong>
        <a className="muted" href="/hospital/donors">Lista ETA</a>
      </div>
      {loading ? <p className={styles.rowMuted}>A carregar dadores aceites...</p> : null}
      {error ? <p className={styles.rowMuted}>{error}</p> : null}
      <p className={styles.rowMuted}>{message}</p>
      {rows.length === 0 ? (
        <EmptyState
          message="Ainda não há dadores a caminho."
          title="Lista ETA vazia"
        />
      ) : (
        <div className={styles.table}>
          {rows.map((row) => (
          <article className={styles.donorRow} key={row.appointmentId}>
            <span>
              <strong>{row.donorName}</strong><br />
              <span className={styles.rowMuted}>
                {row.donorBloodType} · Tel. {row.donorPhone}
              </span>
              <br />
              <span className={styles.rowMuted}>
                Pedido {row.requestBloodType} · {row.requestStatus} · {formatTime(row.createdAt)}
              </span>
            </span>
            <strong style={{ color: "#008a45" }}>{row.eta}</strong>
            <span className="pill red">{row.pin}<br /><span className={styles.rowMuted}>{row.status}</span></span>
            <span className={styles.actions}>
              <button onClick={() => update(row, "Chegou")} type="button">Chegou</button>
              <button onClick={() => update(row, "PIN Validado")} type="button">PIN validado</button>
              <button onClick={() => update(row, "Concluido")} type="button">Doação concluída</button>
              <button onClick={() => update(row, "Cancelado")} type="button">Cancelado</button>
            </span>
          </article>
          ))}
        </div>
      )}
      <a className={styles.footerLink} href="/hospital/donors">Ver todos os dadores</a>
    </section>
  );
}

function formatTime(value?: string) {
  if (!value) return "hora pendente";
  return new Date(value).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
}
