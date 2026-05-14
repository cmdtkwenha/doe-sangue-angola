import { nationalMetrics } from "@doe-sangue-angola/shared-services";
import styles from "./adminCore.module.css";
import { MetricCard } from "./MetricCard";

const extraMetrics = [
  { label: "Unidades em estoque", value: "3.245", change: "-8% vs ontem", tone: "red" as const },
  { label: "Alertas de escassez", value: "8", change: "Requer atenção", tone: "red" as const }
];

export function AdminMetrics() {
  const metrics = [...nationalMetrics, ...extraMetrics];
  const icons = ["□", "!", "H", "U", "G", "△"];

  return (
    <section className={styles.metricGrid}>
      {metrics.map((metric, index) => (
        <MetricCard icon={icons[index]} key={metric.label} metric={metric} />
      ))}
    </section>
  );
}
