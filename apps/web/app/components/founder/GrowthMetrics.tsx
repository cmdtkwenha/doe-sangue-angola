"use client";

import type { BloodRequest, Donor, Hospital } from "@doe-sangue-angola/shared-types";
import { useApiData } from "../../hooks/useApiData";
import styles from "./founder.module.css";

export function GrowthMetrics() {
  const { data: hospitals } = useApiData<Hospital[]>("/api/hospitals", []);
  const { data: donors } = useApiData<Donor[]>("/api/donors", []);
  const { data: requests } = useApiData<BloodRequest[]>("/api/blood-requests", []);
  const metricData = [
    ["Hospitais", hospitals.length, "reais"],
    ["Dadores", donors.length, "reais"],
    ["Pedidos", requests.length, "reais"],
    ["Províncias", new Set(hospitals.map((hospital) => hospital.province)).size, "cobertas"]
  ] as const;

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
