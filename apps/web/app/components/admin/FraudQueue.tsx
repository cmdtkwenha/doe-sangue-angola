import { listFraudReviewQueue } from "@doe-sangue-angola/shared-services";
import styles from "./adminAdvanced.module.css";
import { VerificationStatusBadge } from "./VerificationStatusBadge";

export function FraudQueue() {
  const items = listFraudReviewQueue().filter((item) => item.status !== "Verificado");

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Fila de Revisão de Fraude</strong>
        <span className="pill red">{items.length} casos</span>
      </div>
      {items.map((item) => (
        <article className={styles.row} key={item.id}>
          <div className={styles.rowTop}>
            <strong>{item.id}</strong>
            <VerificationStatusBadge status={item.status} />
          </div>
          <span className="muted">{item.entity}</span>
          <div className={styles.riskLine}>
            <span style={{ width: `${item.score}%` }} />
          </div>
          <small className="muted">{item.flags.join(" · ")}</small>
        </article>
      ))}
    </section>
  );
}
