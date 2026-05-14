import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { quickActions } from "./hospitalAgentService";

export function QuickActionsPanel() {
  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Ações Rápidas</strong>
      </div>
      <div className={styles.actionGrid}>
        {quickActions.map(([title, subtitle, tone]) => (
          <button className={styles.action} key={title} type="button">
            <strong className={tone === "red" ? styles.redText : ""}>{title}</strong>
            <div className={base.rowMuted}>{subtitle}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
