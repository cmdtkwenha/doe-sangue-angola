"use client";

import {
  getRequestStatusLabel,
  isCompletedRequest,
  listRequestsForHospital
} from "@doe-sangue-angola/shared-services";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useMemo } from "react";
import styles from "./hospitalPortal.module.css";
import { currentHospitalId } from "./hospitalPortalData";

export function ActiveRequestsTable() {
  const version = useRealtimeVersion();
  const requests = useMemo(() => listRequestsForHospital(currentHospitalId), [version]);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Pedidos de Sangue Ativos</strong>
        <a className="muted" href="#">Ver todos</a>
      </div>
      <div className={styles.table}>
        {requests.map((request) => (
          <article className={styles.requestRow} key={request.id}>
            <div>
              <strong style={{ color: "#d01424", fontSize: 24 }}>{request.bloodType}</strong>
              <div className={styles.rowMuted}>{request.units} bolsas</div>
            </div>
            <span>ID: #{request.id}<br /><span className={styles.rowMuted}>UTI Geral</span></span>
            <span className={styles.rowMuted}>Criado<br /><strong>{request.createdAt.slice(11, 16)}</strong></span>
            <span className={statusTone(request.status)}>{statusLabel(request.status)}</span>
          </article>
        ))}
      </div>
      <a className={styles.footerLink} href="#">Ver todos os pedidos</a>
    </section>
  );
}

function statusTone(status: string) {
  if (status === "Aberto") return "pill red";
  if (isCompletedRequest(status)) return "pill green";
  return "pill gold";
}

function statusLabel(status: string) {
  return getRequestStatusLabel(status);
}
