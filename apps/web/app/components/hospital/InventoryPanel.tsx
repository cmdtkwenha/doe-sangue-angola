"use client";

import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { EmptyState } from "../ui/EmptyState";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";

export function InventoryPanel() {
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: requests, loading, error } = useApiData<BloodRequest[]>(
    hospitalId ? `/api/blood-requests?hospitalId=${hospitalId}` : "/api/blood-requests?hospitalId=missing",
    [],
    hospitalId.length
  );
  const inventory = buildInventorySummary(requests);

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
          const reserve = Math.max(item.safeMinimum - item.units, 0);
          const critical = item.units < item.safeMinimum;
          return (
          <article className={styles.inventoryRow} key={item.bloodType}>
            <strong>{item.bloodType}</strong>
            <span>{item.units} disponível</span>
            <span>{reserve} reserva</span>
            <span>{item.units + reserve} total</span>
            <span className={critical ? "pill red" : "pill gold"}>
              {critical ? "Crítico" : "Adequado"}
            </span>
          </article>
          );
          })}
        </div>
      )}
      <a className={styles.footerLink} href="/hospital/inventory">Ver inventário completo</a>
    </section>
  );
}

function buildInventorySummary(requests: BloodRequest[]) {
  const grouped = new Map<string, number>();
  requests.forEach((request) => {
    grouped.set(request.bloodType, (grouped.get(request.bloodType) ?? 0) + request.units);
  });
  return Array.from(grouped.entries()).map(([bloodType, units]) => ({
    bloodType,
    safeMinimum: Math.max(units, 1),
    units
  }));
}
