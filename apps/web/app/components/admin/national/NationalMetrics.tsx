import { MetricCard } from "../MetricCard";
import type { NationalMetric } from "./nationalTypes";
import styles from "./national.module.css";

const icons = ["D", "✓", "H", "!", "△", "●", "M"];

export function NationalMetrics({ metrics }: { metrics: NationalMetric[] }) {
  return (
    <section className={styles.metrics}>
      {metrics.map((metric, index) => (
        <MetricCard icon={icons[index] ?? "•"} key={metric.label} metric={metric} />
      ))}
    </section>
  );
}
