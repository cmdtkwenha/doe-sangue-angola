import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { hospitalMessages } from "./hospitalAgentService";

export function CommunicationsPanel() {
  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Comunicações Recentes</strong>
        <a className="muted" href="#">Ver todas</a>
      </div>
      {hospitalMessages.map((item) => (
        <article className={styles.messageRow} key={`${item.title}-${item.target}`}>
          <div className={styles.rowTop}>
            <strong>{item.target}</strong>
            <span className="pill">{item.title}</span>
          </div>
          <span className={base.rowMuted}>{item.body} · {item.status}</span>
        </article>
      ))}
    </section>
  );
}
