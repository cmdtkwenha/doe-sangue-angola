import styles from "./analytics.module.css";

export function TrendCard({
  label,
  note,
  value
}: {
  label: string;
  note: string;
  value: string;
}) {
  return (
    <article className={styles.card}>
      <span className="muted">{label}</span>
      <h3 className={styles.trendValue}>{value}</h3>
      <span className={note.includes("-") ? "pill green" : "pill gold"}>{note}</span>
    </article>
  );
}
