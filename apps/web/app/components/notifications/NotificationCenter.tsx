"use client";

import { useApiData } from "@hooks/useApiData";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import styles from "./notifications.module.css";
import { NotificationBell } from "./NotificationBell";
import { NotificationCard } from "./NotificationCard";
import type { RealNotification } from "./types";

export function NotificationCenter({ all = false }: { all?: boolean }) {
  const liveVersion = useSupabaseRealtimeVersion(["notifications"]);
  const { data, error, loading } = useApiData<RealNotification[]>(
    `/api/notifications${all ? "?all=true" : ""}`,
    [],
    liveVersion
  );

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true })
    });
  }

  return (
    <section className={styles.panel}>
      <div className={styles.rowTop}>
        <span>
          <strong>Centro de Notificações</strong>
          <br />
          <small className="muted">Alertas reais do fluxo de doação.</small>
        </span>
        <NotificationBell all={all} />
      </div>
      <button className={styles.markButton} onClick={() => void markAllRead()} type="button">
        Marcar todas como lidas
      </button>
      {loading ? <LoadingSkeleton label="A sincronizar notificações" /> : null}
      {error ? <p className="muted">{error}</p> : null}
      {data.length === 0 ? (
        <EmptyState title="Sem notificações" message="Os alertas do workflow aparecerão aqui." />
      ) : data.map((item) => <NotificationCard item={item} key={item.id} />)}
    </section>
  );
}
