import type { ReactNode } from "react";
import styles from "./polish.module.css";

export function EmptyState({
  action,
  message,
  title
}: {
  action?: ReactNode;
  message: string;
  title: string;
}) {
  return (
    <article className={styles.stateCard}>
      <span className={styles.icon}>0</span>
      <strong>{title}</strong>
      <span className="muted">{message}</span>
      {action}
    </article>
  );
}
