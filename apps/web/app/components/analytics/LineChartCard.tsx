import styles from "./analytics.module.css";
import { areaPoints, points } from "./chartUtils";

export function LineChartCard({
  area,
  title,
  values
}: {
  area?: boolean;
  title: string;
  values: number[];
}) {
  return (
    <section className={`${styles.card} ${styles.wide}`}>
      <div className={styles.head}>
        <strong>{title}</strong>
        <span className="pill green">7 dias</span>
      </div>
      <svg className={styles.chart} viewBox="0 0 320 120" role="img">
        {area ? <polygon fill="#fff0f1" points={areaPoints(values)} /> : null}
        <polyline fill="none" points={points(values)} stroke="#d01424" strokeWidth="4" />
        <polyline fill="none" points="0,104 320,104" stroke="#edf0f4" />
      </svg>
    </section>
  );
}
