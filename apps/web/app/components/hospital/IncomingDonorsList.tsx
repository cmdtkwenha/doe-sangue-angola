"use client";

import type { Appointment, BloodRequest, Donor } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useState } from "react";
import { EmptyState } from "../ui/EmptyState";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";
import { completeDonationAction, updateAppointmentStatusAction } from "../workflow/workflowActions";

export function IncomingDonorsList() {
  const version = useRealtimeVersion();
  const [message, setMessage] = useState("Aguardando dadores aceites.");
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: appointments, loading, error } = useApiData<Appointment[]>(
    hospitalId ? `/api/appointments?hospitalId=${hospitalId}` : "/api/appointments?hospitalId=missing",
    [],
    version
  );
  const { data: donors } = useApiData<Donor[]>("/api/donors", [], version);
  const { data: requests } = useApiData<BloodRequest[]>(
    hospitalId ? `/api/blood-requests?hospitalId=${hospitalId}` : "/api/blood-requests?hospitalId=missing",
    [],
    version
  );
  const rows = appointments.map((appointment) => {
    const donor = donors.find((item) => item.id === appointment.donorId);
    const request = requests.find((item) => item.id === appointment.bloodRequestId);
    return { appointment, donor, request };
  });

  async function update(row: Appointment, status: Appointment["status"]) {
    setMessage("A atualizar estado do dador...");
    const result = status === "Concluido" && row.bloodRequestId
      ? await completeDonationAction(row.donorId, row.bloodRequestId)
      : await updateAppointmentStatusAction(row.id, status);
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
          message="Os dadores confirmados aparecerão aqui com ETA e PIN."
          title="Sem dadores a caminho"
        />
      ) : (
        <div className={styles.table}>
          {rows.map(({ appointment, donor, request }) => (
          <article className={styles.donorRow} key={appointment.id}>
            <span>
              <strong>{donor?.name ?? "Dador aceite"}</strong><br />
              <span className={styles.rowMuted}>
                {donor?.bloodType ?? "-"} · Tel. {donor?.phone ?? "por completar"}
              </span>
              <br />
              <span className={styles.rowMuted}>
                Pedido {request?.bloodType ?? "-"} · {formatTime(appointment.createdAt)}
              </span>
            </span>
            <strong style={{ color: "#008a45" }}>{appointment.time}</strong>
            <span className="pill red">{appointment.pin}<br /><span className={styles.rowMuted}>{appointment.status}</span></span>
            <span className={styles.actions}>
              <button onClick={() => update(appointment, "Chegou")} type="button">Chegou</button>
              <button onClick={() => update(appointment, "PIN Validado")} type="button">PIN validado</button>
              <button onClick={() => update(appointment, "Concluido")} type="button">Doação concluída</button>
              <button onClick={() => update(appointment, "Cancelado")} type="button">Cancelado</button>
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
