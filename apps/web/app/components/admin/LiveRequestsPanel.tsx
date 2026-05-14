"use client";

import { listLiveRequests } from "@doe-sangue-angola/shared-services";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useMemo } from "react";
import styles from "./adminCore.module.css";

export function LiveRequestsPanel() {
  const version = useRealtimeVersion();
  const requests = useMemo(() => listLiveRequests(), [version]);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Pedidos em Tempo Real</strong>
        <a className="muted" href="#">Ver todos</a>
      </div>
      <div className={styles.requestList}>
        {requests.map((request) => (
          <article className={styles.requestRow} key={request.id}>
            <span className={styles.bloodType}>{request.bloodType}</span>
            <span>
              <strong>{request.hospital?.name}</strong>
              <br />
              <span className="muted">{request.units} bolsas · {request.status}</span>
            </span>
            <span className={request.urgency === "Critica" ? "pill red" : "pill gold"}>
              {request.urgency}
            </span>
          </article>
        ))}
      </div>
      <small className="muted">Atualização local #{version}</small>
    </section>
  );
}
