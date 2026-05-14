import styles from "./mobileGamification.module.css";

export function EligibilityQuestion({
  answer,
  prompt,
  selected
}: {
  answer: string;
  prompt: string;
  selected: boolean;
}) {
  return (
    <article className={styles.question}>
      <span className={`${styles.radio} ${selected ? styles.selected : ""}`}>
        {selected ? "✓" : ""}
      </span>
      <span>
        <strong>{prompt}</strong>
        <br />
        <small className="muted">{answer}</small>
      </span>
    </article>
  );
}
