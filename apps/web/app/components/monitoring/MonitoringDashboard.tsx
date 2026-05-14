import { listApiRequestLogs, listMonitoringRecords } from "@doe-sangue-angola/shared-services";
import { AdminSystemHealthPanel } from "./AdminSystemHealthPanel";
import { BackupStatusPanel } from "./BackupStatusPanel";
import { ErrorLogTable } from "./ErrorLogTable";
import { RecoveryChecklist } from "./RecoveryChecklist";
import styles from "./monitoring.module.css";

export function MonitoringDashboard() {
  const activity = listMonitoringRecords().slice(0, 8);
  const apiLogs = listApiRequestLogs().slice(0, 4);

  return (
    <section className={styles.grid}>
      <AdminSystemHealthPanel />
      <section className={styles.panel}>
        <div className={styles.head}>
          <strong>Atividade Monitorizada</strong>
          <span className="pill gold">Pronto para Sentry</span>
        </div>
        {activity.map((event) => (
          <article className={styles.row} key={event.id}>
            <span>{event.type}</span>
            <span>
              <strong>{event.actor ?? "Sistema"}</strong>
              <br />
              <small className="muted">{event.message}</small>
            </span>
            <span className={`${styles.status} ${styles[event.status]}`}>{event.status}</span>
          </article>
        ))}
      </section>
      <section className={styles.panel}>
        <div className={styles.head}>
          <strong>API Request Logs</strong>
          <span className="pill">Mock</span>
        </div>
        {apiLogs.map((log) => (
          <article className={styles.row} key={log.id}>
            <span>{log.metadata?.path ?? "api.route"}</span>
            <span className="muted">{log.durationMs ?? 0} ms</span>
            <span className={`${styles.status} ${styles[log.status]}`}>{log.status}</span>
          </article>
        ))}
      </section>
      <ErrorLogTable />
      <BackupStatusPanel />
      <RecoveryChecklist />
    </section>
  );
}
