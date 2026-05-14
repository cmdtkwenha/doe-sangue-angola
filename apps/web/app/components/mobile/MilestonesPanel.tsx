import { milestones } from "./mobileDonorAgents";
import styles from "./mobileGamification.module.css";

export function MilestonesPanel() {
  return (
    <section className={styles.panel}>
      <strong>Conquistas</strong>
      {milestones.map(([title, text, done]) => (
        <article className={styles.milestone} key={title}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{title}</strong>
            <span className={done ? styles.check : "pill"}>{done ? "✓" : "○"}</span>
          </div>
          <small className="muted">{text}</small>
        </article>
      ))}
    </section>
  );
}
