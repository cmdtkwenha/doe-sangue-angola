"use client";

import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import styles from "./adminAdvanced.module.css";

export function ShortageAlerts() {
  const { data: requests, error, loading } = useApiData<BloodRequest[]>("/api/blood-requests", [], 0);
  const alerts = requests
    .filter((request) => request.urgency === "Critica" && request.status !== "Cancelado")
    .slice(0, 5);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Alertas de Escassez</strong>
        <a className="muted" href="/admin/reports">Ver todos</a>
      </div>
      {loading ? <p className="muted">A carregar alertas reais...</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      {alerts.length === 0 && !loading ? <p className="muted">Sem alertas críticos ativos.</p> : null}
      {alerts.map((alert) => (
        <article className={styles.row} key={alert.id}>
          <div className={styles.rowTop}>
            <strong>{alert.bloodType} necessário em {alert.province ?? "Angola"}</strong>
            <span className="pill red">Crítico</span>
          </div>
          <span className="muted">{alert.units} bolsas · {alert.municipality ?? "Município por confirmar"}</span>
        </article>
      ))}
    </section>
  );
}
