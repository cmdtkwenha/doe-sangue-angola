import styles from "./analytics.module.css";

export function BarChartCard({
  items,
  title
}: {
  items: readonly (readonly [string, number])[];
  title: string;
}) {
  const max = Math.max(...items.map(([, value]) => value));

  return (
    <section className={`${styles.card} ${styles.wide}`}>
      <div className={styles.head}>
        <strong>{title}</strong>
        <span className="pill gold">Províncias</span>
      </div>
      {items.map(([label, value]) => (
        <div className={styles.barRow} key={label}>
          <strong>{label}</strong>
          <span className={styles.barTrack}>
            <span className={styles.barFill} style={{ width: `${(value / max) * 100}%` }} />
          </span>
          <span className="muted">{value}</span>
        </div>
      ))}
    </section>
  );
}
