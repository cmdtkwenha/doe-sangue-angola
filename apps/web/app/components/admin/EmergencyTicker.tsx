"use client";

import { useEffect, useMemo, useState } from "react";
import { listRequests } from "@doe-sangue-angola/shared-services";
import styles from "./adminAdvanced.module.css";

export function EmergencyTicker() {
  const [active, setActive] = useState(0);
  const requests = useMemo(() => listRequests(), []);

  useEffect(() => {
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
    </section>
  );
}
