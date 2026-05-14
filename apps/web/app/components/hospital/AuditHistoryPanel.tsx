import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { auditHistory } from "./hospitalAgentService";

export function AuditHistoryPanel() {
  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Histórico de Auditoria</strong>
        <a className="muted" href="#">Ver logs</a>
      </div>
      {auditHistory.map((log) => (
        <article className={styles.auditRow} key={log.id}>
          <div className={styles.rowTop}>
            <strong>{log.actor}</strong>
            <span className="pill">{log.time}</span>
          </div>
          <span className={base.rowMuted}>{log.action}</span>
        </article>
      ))}
    </section>
  );
}
