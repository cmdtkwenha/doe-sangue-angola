"use client";

import { listAuditLogs } from "@doe-sangue-angola/shared-services";
import styles from "./workflow.module.css";
import { useWorkflowSnapshot } from "./useWorkflowSnapshot";

export function AuditTrailPanel() {
  useWorkflowSnapshot();
  const logs = listAuditLogs().slice(0, 6);

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <div className={styles.title}>Trilho de Auditoria</div>
        <span className="pill red">Automático</span>
      </div>
      <div className={styles.list}>
        {logs.map((log) => (
          <article className={styles.row} key={log.id}>
            <span><strong>{log.actor}</strong><br /><small>{log.action}</small></span>
            <small className="muted">{log.time}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
