import { listAuditLogs } from "@doe-sangue-angola/shared-services";
import styles from "./adminAdvanced.module.css";

export function AuditLogTable() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Logs de Auditoria Recentes</strong>
        <a className="muted" href="/admin/audit">Ver todos</a>
      </div>
      {listAuditLogs().slice(0, 8).map((log) => (
        <article className={styles.row} key={log.id}>
          <div className={styles.rowTop}>
            <span>{log.time}</span>
            <strong>{log.actor}</strong>
          </div>
          <span className="muted">{log.action}</span>
        </article>
      ))}
    </section>
  );
}
