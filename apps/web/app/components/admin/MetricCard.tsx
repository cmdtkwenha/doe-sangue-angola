import type { Metric } from "@doe-sangue-angola/shared-types";
import styles from "./adminCore.module.css";

export function MetricCard({ metric, icon }: { metric: Metric; icon: string }) {
  return (
    <article className={styles.metricCard}>
      <div className="muted">{metric.label}</div>
      <span className={styles.metricIcon}>{icon}</span>
      <h2 className={styles.metricValue}>{metric.value}</h2>
      <span className={metric.tone === "red" ? "pill red" : "pill"}>
        {metric.change}
      </span>
    </article>
  );
}
