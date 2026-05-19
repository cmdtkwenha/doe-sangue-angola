"use client";

import { getDataMode, listLiveRequests } from "@doe-sangue-angola/shared-services";
import type { BloodRequest, Hospital } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useMemo } from "react";
import styles from "./adminCore.module.css";

type LiveRequest = BloodRequest & { hospital?: Hospital };

export function LiveRequestsPanel() {
  const version = useRealtimeVersion();
  const fallback = useMemo(() =>
    getDataMode() === "mock" ? listLiveRequests() : [], [version]);
  const { data: requests, error, loading } = useApiData<LiveRequest[]>(
    "/api/blood-requests",
    fallback,
    version
  );

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Pedidos em Tempo Real</strong>
        <a className="muted" href="/admin/requests">Ver todos</a>
      </div>
      <div className={styles.requestList}>
        {loading ? <p className="muted">A sincronizar pedidos reais...</p> : null}
        {error ? <p className="muted">{error}</p> : null}
        {requests.map((request) => (
          <article className={styles.requestRow} key={request.id}>
            <span className={styles.bloodType}>{request.bloodType}</span>
            <span>
              <strong>{request.hospital?.name ?? request.hospitalId}</strong>
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
