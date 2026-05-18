import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { expiringUnits } from "./hospitalAgentService";

export function ExpiringUnitsPanel() {
  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Unidades Próximas do Vencimento</strong>
        <a className="muted" href="/hospital/inventory">Ver todas</a>
      </div>
      {expiringUnits.map(([type, units, window]) => (
        <article className={styles.unitRow} key={type}>
          <div className={styles.rowTop}>
            <strong className={styles.redText}>{type}</strong>
            <span className="pill gold">{window}</span>
          </div>
          <span className={base.rowMuted}>{units} em reserva técnica</span>
        </article>
      ))}
    </section>
  );
}
