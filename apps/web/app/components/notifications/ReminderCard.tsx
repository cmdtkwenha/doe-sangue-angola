import styles from "./notifications.module.css";

export function ReminderCard({
  action,
  body,
  title
}: {
  action: string;
  body: string;
  title: string;
}) {
  return (
    <article className={styles.reminder}>
      <div className={styles.rowTop}>
        <strong>{title}</strong>
        <span className="pill gold">{action}</span>
      </div>
      <span className="muted">{body}</span>
    </article>
  );
}
