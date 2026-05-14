import { listExpirationAlerts } from "@doe-sangue-angola/shared-services";
import styles from "./hospitalAutomation.module.css";

export function ExpirationAlerts() {
  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Alertas de Validade</strong>
        <span className="pill red">{listExpirationAlerts().length} alertas</span>
      </div>
      <div className={styles.grid}>
        {listExpirationAlerts().map((alert) => (
          <article className={styles.alert} key={alert.id}>
            <div className={styles.row}>
              <strong>{alert.bloodType}</strong>
              <span className={alert.status === "Crítico" ? styles.critical : "muted"}>{alert.status}</span>
            </div>
            <span className="muted">
              {alert.units} unidades expiram em {alert.expiresInDays} dia(s).
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
