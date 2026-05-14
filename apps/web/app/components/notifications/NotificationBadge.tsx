import styles from "./notifications.module.css";

export function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return <span className={styles.badge}>{count}</span>;
}
