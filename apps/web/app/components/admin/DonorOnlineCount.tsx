"use client";

import type { Donor } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { EmptyState } from "../ui/EmptyState";
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
      {!loading && count === 0 ? (
        <EmptyState title="Sem dadores registados" message="Os dadores aparecem após onboarding real." />
      ) : null}
    </section>
  );
}
