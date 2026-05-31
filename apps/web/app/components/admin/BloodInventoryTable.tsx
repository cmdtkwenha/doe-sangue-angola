"use client";

import { useApiData } from "@hooks/useApiData";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import { MobileTable } from "../ui/MobileTable";
import styles from "./adminCore.module.css";

type InventoryItem = {
  bloodType: string;
  safeMinimum: number;
  units: number;
};
type InventorySummary = {
  items: InventoryItem[];
  shortagesByProvince: Array<{ critical: number; low: number; province: string }>;
};

export function BloodInventoryTable() {
  const { data: summary, error, loading } = useApiData<InventorySummary>(
    "/api/admin/inventory-summary",
    { items: [], shortagesByProvince: [] }
  );
  const inventory = summary.items;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Inventário de Sangue</strong>
        <a className="muted" href="/admin/reports">Ver detalhes</a>
      </div>
      {loading ? <LoadingSkeleton label="A carregar inventário real" /> : null}
      {error ? <p className="muted">{error}</p> : null}
      {!loading && !inventory.length ? (
        <EmptyState
          title="Sem inventário real"
          message="O inventário aparece quando hospitais registarem stock."
        />
      ) : null}
      <MobileTable
        columns={["Tipo", "Unidades", "Nível", "Estado"]}
        rows={inventory.map((item) => {
          const percent = Math.min(100, Math.round((item.units / item.safeMinimum) * 100));
          const low = item.units < item.safeMinimum;
          return {
            id: item.bloodType,
            cells: [
              <strong key="type">{item.bloodType}</strong>,
              `${item.units} unidades`,
              <div className={styles.bar} key="bar"><span style={{ width: `${percent}%` }} /></div>,
              <span className={low ? "pill red" : "pill"} key="status">
                {low ? "Crítico" : "Adequado"}
              </span>
            ]
          };
        })}
      />
      {summary.shortagesByProvince.length ? (
        <div className={styles.requestList}>
          {summary.shortagesByProvince.map((item) => (
            <article className={styles.requestRow} key={item.province}>
              <strong>{item.province}</strong>
              <span>{item.critical} críticos · {item.low} baixos</span>
              <span className={item.critical ? "pill red" : "pill gold"}>Escassez</span>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
