import { getInventoryAutomationSummary } from "@doe-sangue-angola/shared-services";
import styles from "./hospitalAutomation.module.css";

export function InventoryUpdater() {
  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <strong>Automação de Inventário</strong>
        <span className="pill green">Sincronizado</span>
      </div>
      <div className={styles.grid}>
        {getInventoryAutomationSummary().map((item) => {
          const percent = Math.min(100, Math.round((item.units / item.safeMinimum) * 100));
          return (
            <article className={styles.inventory} key={item.bloodType}>
              <div className={styles.row}>
                <strong>{item.bloodType}</strong>
                <span className={item.status === "Baixo" ? styles.critical : styles.ok}>{item.status}</span>
              </div>
              <div className={styles.meter}><span style={{ width: `${percent}%` }} /></div>
              <small className="muted">{item.units} unidades · mínimo {item.safeMinimum}</small>
            </article>
          );
        })}
      </div>
    </section>
  );
}
