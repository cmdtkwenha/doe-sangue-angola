import { alerts } from "@doe-sangue-angola/shared-services";
import styles from "./adminAdvanced.module.css";

export function ShortageAlerts() {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Alertas de Escassez</strong>
        <a className="muted" href="/admin/reports">Ver todos</a>
      </div>
      {alerts.map((alert) => (
        <article className={styles.row} key={alert.id}>
          <div className={styles.rowTop}>
            <strong>{alert.title}</strong>
            <span className={`pill ${alert.severity === "critical" ? "red" : "gold"}`}>
              {alert.severity === "critical" ? "Crítico" : "Atenção"}
            </span>
          </div>
          <span className="muted">{alert.message}</span>
        </article>
      ))}
    </section>
  );
}
