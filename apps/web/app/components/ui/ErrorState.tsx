import styles from "./polish.module.css";
import { RetryButton } from "./RetryButton";

export function ErrorState({
  message,
  onRetry,
  title
}: {
  message: string;
  onRetry?: () => void;
  title: string;
}) {
  return (
    <article className={styles.stateCard} role="alert">
      <span className={styles.icon}>!</span>
      <strong>{title}</strong>
      <span className="muted">{message}</span>
      <RetryButton onRetry={onRetry} />
    </article>
  );
}
