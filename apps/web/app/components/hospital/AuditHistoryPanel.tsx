"use client";

import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { useApiData } from "../../hooks/useApiData";
import { useRealtimeVersion } from "../../hooks/useRealtimeVersion";
import { useCurrentHospital } from "./useCurrentHospital";

export function AuditHistoryPanel() {
  const version = useRealtimeVersion();
  const { data: hospital } = useCurrentHospital();
  const path = hospital?.id ? `/api/blood-requests?hospitalId=${hospital.id}&scope=all` : "/api/blood-requests?hospitalId=missing";
  const { data: requests, error, loading } = useApiData<BloodRequest[]>(path, [], version);
  const logs = requests.slice(0, 4).map((request) => ({
    action: `Pedido ${request.bloodType} está ${request.status}`,
    actor: hospital?.name ?? "Hospital",
    id: request.id,
    time: new Date(request.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
  }));
  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Histórico de Auditoria</strong>
        <a className="muted" href="/hospital/reports">Ver logs</a>
      </div>
      {loading ? <p className={base.rowMuted}>A carregar auditoria real...</p> : null}
      {error ? <p className={base.rowMuted}>{error}</p> : null}
      {logs.length === 0 ? <p className={base.rowMuted}>Sem auditoria recente disponível.</p> : null}
      {logs.slice(0, 4).map((log) => (
        <article className={styles.auditRow} key={log.id}>
          <div className={styles.rowTop}>
            <strong>{log.actor}</strong>
            <span className="pill">{log.time}</span>
          </div>
          <span className={base.rowMuted}>{log.action}</span>
        </article>
      ))}
    </section>
  );
}
