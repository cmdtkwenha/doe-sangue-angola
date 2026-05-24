"use client";

import { useEffect, useMemo, useState } from "react";
import { getDataMode, listRequests } from "@doe-sangue-angola/shared-services";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import styles from "./adminAdvanced.module.css";

export function EmergencyTicker() {
  const [active, setActive] = useState(0);
  const version = useRealtimeVersion();
  const fallback = useMemo(() => getDataMode() === "mock" ? listRequests() : [], []);
  const { data } = useApiData<BloodRequest[]>("/api/blood-requests", fallback, version);
  const requests = data.filter((request) => request.urgency === "Critica");

  useEffect(() => {
    if (requests.length === 0) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % requests.length);
    }, 2200);

    return () => window.clearInterval(id);
  }, [requests.length]);

  const ordered = useMemo(() => [
    ...requests.slice(active),
    ...requests.slice(0, active)
  ], [active, requests]);

  return (
    <section className={styles.ticker} aria-label="Ticker de emergências">
      <strong>Pedidos críticos ao vivo</strong>
      {ordered.map((request) => (
        <span className={styles.tickerItem} key={request.id}>
          {request.bloodType} · {request.units} bolsas · {request.urgency}
        </span>
      ))}
      {ordered.length === 0 ? <span className={styles.tickerItem}>Sem emergências ativas</span> : null}
    </section>
  );
}
