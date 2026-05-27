"use client";

import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";
import { useApiData } from "../../hooks/useApiData";
import { useRealtimeVersion } from "../../hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "../../hooks/useSupabaseRealtimeVersion";
import { useCurrentHospital } from "./useCurrentHospital";

export function CommunicationsPanel() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["blood_requests", "donor_responses"]);
  const { data: hospital } = useCurrentHospital();
  const path = hospital?.id ? `/api/blood-requests?hospitalId=${hospital.id}` : "/api/blood-requests?hospitalId=missing";
  const { data: requests, error, loading } = useApiData<BloodRequest[]>(path, [], version + liveVersion);
  const messages = requests.slice(0, 4).map((request) => ({
    body: `Pedido ${request.bloodType} com estado ${request.status}`,
    status: request.urgency,
    target: request.patientCode,
    title: "Sistema"
  }));
  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Comunicações Recentes</strong>
        <a className="muted" href="/hospital/reports">Ver todas</a>
      </div>
      {loading ? <p className={base.rowMuted}>A sincronizar comunicações...</p> : null}
      {error ? <p className={base.rowMuted}>{error}</p> : null}
      {messages.length === 0 ? <p className={base.rowMuted}>Sem comunicações recentes.</p> : null}
      {messages.map((item) => (
        <article className={styles.messageRow} key={`${item.title}-${item.target}`}>
          <div className={styles.rowTop}>
            <strong>{item.target}</strong>
            <span className="pill">{item.title}</span>
          </div>
          <span className={base.rowMuted}>{item.body} · {item.status}</span>
        </article>
      ))}
    </section>
  );
}
