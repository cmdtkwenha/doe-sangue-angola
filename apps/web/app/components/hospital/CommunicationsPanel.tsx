"use client";

import { useApiData } from "../../hooks/useApiData";
import { useSupabaseRealtimeVersion } from "../../hooks/useSupabaseRealtimeVersion";
import type { RealNotification } from "../notifications/types";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import base from "./hospitalPortal.module.css";
import styles from "./hospitalAdvanced.module.css";

export function CommunicationsPanel() {
  const liveVersion = useSupabaseRealtimeVersion(["notifications"]);
  const { data: alerts, error, loading } = useApiData<RealNotification[]>(
    "/api/notifications",
    [],
    liveVersion
  );
  return (
    <section className={base.panel}>
      <div className={base.panelHead}>
        <strong>Alertas Recentes do Workflow</strong>
        <a className="muted" href="/hospital/reports">Ver todas</a>
      </div>
      {loading ? <LoadingSkeleton label="A sincronizar alertas" /> : null}
      {error ? <p className={base.rowMuted}>{error}</p> : null}
      {alerts.length === 0 ? (
        <EmptyState title="Sem alertas recentes" message="Aceitações e validações aparecerão aqui." />
      ) : alerts.slice(0, 4).map((item) => (
        <article className={styles.messageRow} key={item.id}>
          <div className={styles.rowTop}>
            <strong>{item.title}</strong>
            <span className={item.read ? "pill" : "pill red"}>{item.type}</span>
          </div>
          <span className={base.rowMuted}>{item.message}</span>
        </article>
      ))}
    </section>
  );
}
