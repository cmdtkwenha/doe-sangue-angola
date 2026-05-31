import { EmptyState } from "../../ui/EmptyState";
import type { NationalAlert } from "./nationalTypes";
import styles from "./national.module.css";

export function NationalAlerts({ alerts }: { alerts: NationalAlert[] }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Alertas Críticos</strong>
        <span className="muted">Inventário e pedidos</span>
      </div>
      {!alerts.length ? (
        <EmptyState title="Sem alertas críticos" message="Nenhuma escassez nacional ativa neste momento." />
      ) : (
        <div className={styles.list}>
          {alerts.map((alert) => (
            <article className={styles.row} key={alert.id}>
              <span className={styles[alert.severity === "info" ? "stable" : alert.severity]}>{alert.severity === "critical" ? "Crítico" : "Atenção"}</span>
              <strong>{alert.title}</strong>
              <small>{alert.message}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
