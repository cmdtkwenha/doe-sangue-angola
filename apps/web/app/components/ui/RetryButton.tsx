"use client";

import styles from "./polish.module.css";

export function RetryButton({
  label = "Tentar novamente",
  onRetry
}: {
  label?: string;
  onRetry?: () => void;
}) {
  return (
    <button
      className={styles.retryButton}
      onClick={onRetry ?? (() => window.location.reload())}
      type="button"
    >
      {label}
    </button>
  );
}
