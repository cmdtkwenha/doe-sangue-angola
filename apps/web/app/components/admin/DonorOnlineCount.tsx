"use client";

import type { Donor } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import styles from "./adminAdvanced.module.css";

export function DonorOnlineCount() {
  const version = useRealtimeVersion();
  const { data: donors, loading } = useApiData<Donor[]>("/api/donors", [], version);
  const count = donors.length;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Dadores Online</strong>
        <span className="pill"><span className={styles.statusDot} />Estável</span>
      </div>
      <h2 style={{ fontSize: 34, margin: "8px 0" }}>{loading ? "..." : count.toLocaleString("pt-PT")}</h2>
      <span className="muted">Dadores registados · atualização em tempo real</span>
      <svg className={styles.chart} viewBox="0 0 420 170">
        <path d="M0 150 L50 120 L100 126 L150 92 L200 99 L250 56 L300 72 L350 40 L420 28" fill="none" stroke="#087443" strokeWidth="5" />
      </svg>
    </section>
  );
}
