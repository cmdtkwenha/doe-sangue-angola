import type { BloodMonitorItem } from "./nationalTypes";
import styles from "./national.module.css";

export function BloodTypeMonitoring({ items }: { items: BloodMonitorItem[] }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Monitorização por Tipo Sanguíneo</strong>
        <span className="muted">Stock vs procura</span>
      </div>
      <div className={styles.bloodGrid}>
        {items.map((item) => {
          const percent = Math.min(100, Math.round((item.units / Math.max(1, item.safeMinimum)) * 100));
          return (
            <article className={styles.bloodCard} key={item.bloodType}>
              <div className={styles.bloodTop}>
                <strong>{item.bloodType}</strong>
                <span className={styles[item.status]}>{statusLabel(item.status)}</span>
              </div>
              <div className={styles.stockBar}><span style={{ width: `${percent}%` }} /></div>
              <small>{item.units} unidades · procura {item.demand}</small>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function statusLabel(status: BloodMonitorItem["status"]) {
  return {
    critical: "Crítico",
    stable: "Estável",
    surplus: "Excedente",
    warning: "Atenção"
  }[status];
}
