import { listVerificationQueue } from "@doe-sangue-angola/shared-services";
import styles from "./adminAdvanced.module.css";
import { VerificationStatusBadge } from "./VerificationStatusBadge";

export function VerificationQueue() {
  const queue = listVerificationQueue();

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Verificação de Entidades</strong>
        <a className="muted" href="#">Ver todos</a>
      </div>
      {queue.map((item) => (
        <article className={styles.row} key={item.id}>
          <div className={styles.rowTop}>
            <strong>{item.entity}</strong>
            <VerificationStatusBadge status={item.status} />
          </div>
          <span className="muted">{item.kind} · {item.province} · {item.reason}</span>
        </article>
      ))}
    </section>
  );
}
