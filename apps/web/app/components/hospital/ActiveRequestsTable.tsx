"use client";

import {
  getRequestStatusLabel,
  getDataMode,
  isCompletedRequest,
  listRequestsForHospital
} from "@doe-sangue-angola/shared-services";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useMemo } from "react";
import { EmptyState } from "../ui/EmptyState";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";
import { updateStatusAction } from "../workflow/workflowActions";

export function ActiveRequestsTable() {
  const version = useRealtimeVersion();
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const fallback = useMemo(() =>
    getDataMode() === "mock" && hospitalId ? listRequestsForHospital(hospitalId) : [],
  [hospitalId, version]);
  const { data: requests, error, loading } = useApiData<BloodRequest[]>(
    hospitalId ? `/api/blood-requests?hospitalId=${hospitalId}` : "/api/blood-requests?hospitalId=missing",
    fallback,
    version
  );

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Pedidos de Sangue Ativos</strong>
        <a className="muted" href="/hospital/requests">Ver todos</a>
      </div>
      {loading ? <p className={styles.rowMuted}>A sincronizar pedidos reais...</p> : null}
      {error ? <p className={styles.rowMuted}>{error}</p> : null}
      {requests.length === 0 ? (
        <EmptyState
          message="Crie um pedido urgente quando precisar de dadores compatíveis."
          title="Sem pedidos ativos"
        />
      ) : (
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
            {!isCompletedRequest(request.status) ? (
              <button
                className="button secondary"
                onClick={() => void updateStatusAction(request.id, "Cancelado")}
                type="button"
              >
                Fechar
              </button>
            ) : null}
          </article>
          ))}
        </div>
      )}
      <a className={styles.footerLink} href="/hospital/requests">Ver todos os pedidos</a>
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
