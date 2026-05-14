"use client";

import { createWorkflowRequest, workflowStatuses } from "@doe-sangue-angola/shared-services";
import styles from "./workflow.module.css";
import { useWorkflowSnapshot } from "./useWorkflowSnapshot";

export function RequestStatusTimeline() {
  const { request, hospital, refresh } = useWorkflowSnapshot();
  const active = Math.max(0, workflowStatuses.indexOf(request?.status as never));

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
        <button className={`${styles.button} ${styles.primary}`} onClick={() => { createWorkflowRequest(); refresh(); }} type="button">
          Criar pedido O- urgente
        </button>
      </div>
    </section>
  );
}
