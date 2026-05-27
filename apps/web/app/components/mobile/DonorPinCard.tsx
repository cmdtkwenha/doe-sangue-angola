"use client";

import type { DonorResponseStatus } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import styles from "./mobileApp.module.css";

type DonorPin = {
  bloodRequestId: string;
  etaMinutes: number;
  hospitalLocation: string;
  hospitalName: string;
  pin: string;
  requestBloodType: string;
  responseId: string;
  status: DonorResponseStatus;
};

export function DonorPinCard() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["donor_responses", "blood_requests", "donors"]);
  const { data, error, loading } = useApiData<DonorPin[]>(
    "/api/donor/responses",
    [],
    version + liveVersion
  );
  const current = data.find((item) => isActive(item.status));

  return (
    <article className={`${styles.card} ${current ? styles.pinCard : ""}`}>
      {loading ? <LoadingSkeleton label="A sincronizar PIN de doação" /> : null}
      {error ? <p className="muted">{error}</p> : null}
      {!current ? (
        <>
          <strong>Meu PIN de Doação</strong>
          <p className="muted">Aceite um pedido para gerar o seu PIN.</p>
        </>
      ) : (
        <div className={styles.successCard}>
          <div className={styles.pinHero}>
            <small>Meu PIN de Doação</small>
            <strong>PIN {current.pin}</strong>
          </div>
          <div className={styles.pinHospital}>
            <strong>Pedido aceite com sucesso</strong>
            <p className="muted">
              {current.hospitalName}<br />
              {current.hospitalLocation}
            </p>
          </div>
          <div className={styles.pinGrid}>
            <span><small>Tipo</small><strong>{current.requestBloodType}</strong></span>
            <span><small>ETA</small><strong>{current.etaMinutes} min</strong></span>
            <span><small>Estado</small><strong>{statusLabel(current.status)}</strong></span>
          </div>
        </div>
      )}
    </article>
  );
}

function isActive(status: DonorResponseStatus) {
  return status !== "completed" && status !== "cancelled";
}

function statusLabel(status: DonorResponseStatus) {
  const labels: Record<DonorResponseStatus, string> = {
    accepted: "Dador a Caminho",
    arrived: "Chegou",
    cancelled: "Cancelado",
    completed: "Doação concluída",
    pin_validated: "PIN Validado"
  };
  return labels[status] ?? status;
}
