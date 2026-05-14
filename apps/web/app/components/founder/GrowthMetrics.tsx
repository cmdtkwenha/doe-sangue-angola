import { donors, hospitals, requests } from "@doe-sangue-angola/shared-services";
import styles from "./founder.module.css";

const metricData = [
  ["Hospitais", hospitals.length, "+2 piloto"],
  ["Dadores", donors.length, "+4 teste"],
  ["Pedidos", requests.length, "ativos"],
  ["Províncias", new Set(hospitals.map((hospital) => hospital.province)).size, "cobertas"]
] as const;

export function GrowthMetrics() {
  return (
    <section className={styles.panel}>
      <div className="eyebrow">Crescimento</div>
      <h2>Métricas simples</h2>
      <div className={styles.metricGrid}>
        {metricData.map(([label, value, note]) => (
          <article className={styles.metric} key={label}>
            <span className="muted">{label}</span>
            <strong>{value}</strong>
            <span className="pill">{note}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
