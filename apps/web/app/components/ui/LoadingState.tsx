import styles from "./polish.module.css";

export function LoadingState({
  label = "A preparar dados em segurança",
  rows = 3
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <article className={styles.stateCard} aria-live="polite">
      <span className={styles.icon}>...</span>
      <strong>{label}</strong>
      {Array.from({ length: rows }).map((_, index) => (
        <span
          className={`${styles.skeleton} ${index === rows - 1 ? styles.short : styles.wide}`}
          key={index}
        />
      ))}
    </article>
  );
}
