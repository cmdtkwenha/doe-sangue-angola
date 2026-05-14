import type { DemoStep } from "@doe-sangue-angola/shared-services";
import styles from "./demo.module.css";

const tone = {
  "Ao vivo": styles.live,
  "Concluído": styles.done,
  Pronto: styles.ready
};

export function DemoStepCard({ step }: { step: DemoStep }) {
  return (
    <article className={styles.step}>
      <div className={styles.meta}>
        <span className={styles.number}>{step.id}</span>
        <span className={`${styles.badge} ${tone[step.status]}`}>{step.status}</span>
      </div>
      <strong>{step.title}</strong>
      <span className={styles.actor}>{step.actor}</span>
      <span className="muted">{step.detail}</span>
    </article>
  );
}
