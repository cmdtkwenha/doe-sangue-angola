"use client";

import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { useApiData } from "../../hooks/useApiData";
import { useRealtimeVersion } from "../../hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "../../hooks/useSupabaseRealtimeVersion";
import { useCurrentHospital } from "./useCurrentHospital";

const toneMap: Record<string, string> = {
  Crítico: "pill red",
  Atenção: "pill gold",
  Estável: "pill green"
};

export function RegionAlerts() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["blood_requests", "donor_responses"]);
  const { data: hospital } = useCurrentHospital();
  const path = hospital?.id ? `/api/blood-requests?hospitalId=${hospital.id}` : "/api/blood-requests?hospitalId=missing";
  const { data: requests } = useApiData<BloodRequest[]>(path, [], version + liveVersion);
  const province = hospital?.province ?? "Angola";
  const alerts = requests
    .filter((request) => request.province === hospital?.province && request.status !== "Concluído")
    .slice(0, 3)
    .map((request) => [
      request.urgency === "Critica" ? "Crítico" : request.urgency === "Alta" ? "Atenção" : "Estável",
      `${province} com pedido ${request.bloodType}`,
      `${request.units} bolsas necessárias em ${request.municipality ?? "município"}`
    ]);
  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Alertas de Escassez Regional</strong>
        <span className="pill red">{province}</span>
      </div>
      {alerts.length === 0 ? <p className={base.rowMuted}>Sem alertas regionais ativos.</p> : null}
      {alerts.map(([level, title, action]) => (
        <article className={styles.alertLine} key={title}>
          <div className={styles.rowTop}>
            <strong>{title}</strong>
            <span className={toneMap[level]}>{level}</span>
          </div>
          <span className={base.rowMuted}>{action}</span>
        </article>
      ))}
    </section>
  );
}
