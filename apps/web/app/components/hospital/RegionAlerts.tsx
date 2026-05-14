import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { regionAlerts } from "./hospitalAgentService";

const toneMap: Record<string, string> = {
  Crítico: "pill red",
  Atenção: "pill gold",
  Estável: "pill green"
};

export function RegionAlerts() {
  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Alertas de Escassez Regional</strong>
        <span className="pill red">Luanda</span>
      </div>
      {regionAlerts.map(([level, title, action]) => (
        <article className={styles.alertLine} key={title}>
          <div className={styles.rowTop}>
            <strong>{title}</strong>
            <span className={toneMap[level]}>{level}</span>
          </div>
          <span className={base.rowMuted}>{action}</span>
        </article>
      ))}
    </section>
  );
}
