"use client";

import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { EmptyState } from "../ui/EmptyState";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";

type InventoryRow = {
  bloodType: string;
  daysRemaining: number;
  safeMinimum: number;
  status: "Adequado" | "Baixo" | "Crítico";
  trend: string;
  units: number;
};

export function InventoryPanel() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["hospital_inventory", "blood_requests", "donor_responses"]);
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: inventory, loading, error } = useApiData<InventoryRow[]>(
    hospitalId ? `/api/hospital/inventory?hospitalId=${hospitalId}` : "/api/hospital/inventory?hospitalId=missing",
    [],
    version + liveVersion
  );

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Inventário de Sangue</strong>
        <a className="muted" href="/hospital/inventory">Ver detalhes</a>
      </div>
      {loading ? <p className={styles.rowMuted}>A calcular inventário real...</p> : null}
      {error ? <p className={styles.rowMuted}>{error}</p> : null}
      {inventory.length === 0 ? (
        <EmptyState
          message="Registe unidades para acompanhar disponibilidade e reservas."
          title="Inventário vazio"
        />
      ) : (
        <div className={styles.table}>
          {inventory.map((item) => {
          const critical = item.status === "Crítico";
          return (
          <article className={styles.inventoryRow} key={item.bloodType}>
            <strong>{item.bloodType}</strong>
            <span>{item.units} disponível</span>
            <span>{item.daysRemaining} dias restantes</span>
            <span>{item.trend}</span>
            <span className={critical ? "pill red" : "pill gold"}>{item.status}</span>
          </article>
          );
          })}
        </div>
      )}
      <a className={styles.footerLink} href="/hospital/inventory">Ver inventário completo</a>
    </section>
  );
}
