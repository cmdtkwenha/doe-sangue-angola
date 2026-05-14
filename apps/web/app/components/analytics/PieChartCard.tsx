import styles from "./analytics.module.css";

export function PieChartCard({
  items,
  title
}: {
  items: readonly (readonly [string, number, string])[];
  title: string;
}) {
  const gradient = items
    .reduce<{ parts: string[]; start: number }>((acc, [, value, color]) => {
      const end = acc.start + value;
      acc.parts.push(`${color} ${acc.start}% ${end}%`);
      acc.start = end;
      return acc;
    }, { parts: [], start: 0 })
    .parts.join(", ");

  return (
    <section className={styles.card}>
      <div className={styles.head}><strong>{title}</strong></div>
      <div style={{ display: "grid", placeItems: "center" }}>
        <div style={{ width: 130, height: 130, borderRadius: "50%", background: `conic-gradient(${gradient})` }} />
      </div>
      <div className={styles.pieLegend}>
        {items.map(([label, value, color]) => (
          <div className={styles.legendRow} key={label}>
            <span><i className={styles.dot} style={{ background: color }} />{label}</span>
            <strong>{value}%</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
