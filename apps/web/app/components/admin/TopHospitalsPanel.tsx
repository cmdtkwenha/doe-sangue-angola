"use client";

import { hospitals as mockHospitals } from "@doe-sangue-angola/shared-services";
import type { Hospital } from "@doe-sangue-angola/shared-types";
import { useApiData } from "../../hooks/useApiData";
import styles from "./adminAdvanced.module.css";

const totals = [342, 238, 189];

export function TopHospitalsPanel() {
  const fallback = process.env.NODE_ENV === "development" ? mockHospitals : [];
  const { data: hospitals } = useApiData<Hospital[]>("/api/hospitals", fallback, 0);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Top Hospitais por Pedidos</strong>
        <span className="muted">Últimos 30 dias</span>
      </div>
      {hospitals.slice(0, 5).map((hospital, index) => (
        <div className={styles.barRow} key={hospital.id}>
          <strong>{index + 1}. {hospital.name}</strong>
          <div className={styles.bar}>
            <span style={{ width: `${90 - index * 18}%` }} />
          </div>
          <span className="muted">{totals[index] ?? 0} pedidos</span>
        </div>
      ))}
    </section>
  );
}
