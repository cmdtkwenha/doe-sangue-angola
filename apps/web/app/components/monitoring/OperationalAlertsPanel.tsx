import { getOperationalAlerts } from "@doe-sangue-angola/shared-services";
import styles from "./monitoring.module.css";

export function OperationalAlertsPanel() {
  const alerts = getOperationalAlerts();

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Alertas Operacionais</strong>
        <span className="pill red">{alerts.filter((item) => item.active).length} ativos</span>
      </div>
      {alerts.map((alert) => (
        <article className={styles.row} key={alert.title}>
          <span className={`${styles.status} ${alert.active ? styles.warning : styles.ok}`}>
            {alert.active ? "Verificar" : "OK"}
          </span>
          <span>
            <strong>{alert.title}</strong>
            <br />
            <small className="muted">{alert.action}</small>
          </span>
          <span className="muted">{alert.severity}</span>
        </article>
      ))}
    </section>
  );
}
