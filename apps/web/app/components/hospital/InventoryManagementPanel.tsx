"use client";

import { useState } from "react";
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
type Movement = "donation_received" | "stock_added" | "stock_consumed" | "stock_expired";

const movementLabels: Record<Movement, string> = {
  donation_received: "Doação recebida",
  stock_added: "Stock adicionado",
  stock_consumed: "Stock consumido",
  stock_expired: "Stock expirado"
};

export function InventoryManagementPanel() {
  const [busyType, setBusyType] = useState("");
  const [message, setMessage] = useState("");
  const [movement, setMovement] = useState<Movement>("donation_received");
  const [units, setUnits] = useState(1);
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["hospital_inventory", "inventory_movements"]);
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: inventory, error, loading } = useApiData<InventoryRow[]>(
    hospitalId ? `/api/hospital/inventory?hospitalId=${hospitalId}` : "/api/hospital/inventory?hospitalId=missing",
    [],
    version + liveVersion + Number(Boolean(message))
  );

  async function submit(bloodType: string) {
    setBusyType(bloodType);
    setMessage("");
    const response = await fetch("/api/hospital/inventory", {
      body: JSON.stringify({ bloodType, movementType: movement, units }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });
    const payload = await response.json() as { message?: string; ok: boolean };
    setBusyType("");
    setMessage(payload.ok ? "Inventário atualizado com sucesso." : payload.message ?? "Falha ao atualizar inventário.");
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Gestão de Inventário</strong>
        <span className="pill">8 tipos sanguíneos</span>
      </div>
      <div className={styles.actions}>
        <select onChange={(event) => setMovement(event.target.value as Movement)} value={movement}>
          {Object.entries(movementLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input min={1} onChange={(event) => setUnits(Number(event.target.value))} type="number" value={units} />
      </div>
      {loading ? <p className={styles.rowMuted}>A carregar stock atual...</p> : null}
      {error || message ? <p className={styles.rowMuted}>{error || message}</p> : null}
      {!loading && !inventory.length ? (
        <EmptyState title="Inventário vazio" message="Registe a primeira movimentação para iniciar o controlo." />
      ) : (
        <div className={styles.table}>
          {inventory.map((item) => (
            <article className={styles.inventoryRow} key={item.bloodType}>
              <strong>{item.bloodType}</strong>
              <span>{item.units} unidades</span>
              <span>{item.safeMinimum} mínimo</span>
              <span className={item.status === "Crítico" ? "pill red" : "pill gold"}>{item.status}</span>
              <button disabled={busyType === item.bloodType} onClick={() => submit(item.bloodType)} type="button">
                {busyType === item.bloodType ? "A guardar..." : "Registar"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
