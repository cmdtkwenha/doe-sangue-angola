"use client";

import { getWorkflowSnapshot } from "@doe-sangue-angola/shared-services";
import styles from "./hospitalAutomation.module.css";

export function AppointmentConfirmation() {
  const { appointment, request } = getWorkflowSnapshot();

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Agendamento</strong>
        <span className="pill green">{appointment?.status ?? "Pendente"}</span>
      </div>
      <div className={styles.step}>
        <span className="muted">Pedido</span>
        <strong>{request?.patientCode ?? "Aguardando pedido"}</strong>
      </div>
      <div className={styles.row}>
        <span>{appointment?.date ?? "Hoje"}</span>
        <strong>{appointment?.time ?? "09:30"}</strong>
        <span className="pill gold">PIN {appointment?.pin ?? "----"}</span>
      </div>
    </section>
  );
}
