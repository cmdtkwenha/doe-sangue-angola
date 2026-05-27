"use client";

import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import styles from "./mobileApp.module.css";

type DonorPin = {
  bloodRequestId: string;
  etaMinutes: number;
  hospitalLocation: string;
  hospitalName: string;
  pin: string;
  requestBloodType: string;
  status: string;
};

export function DonorPinCard() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["donor_responses", "blood_requests"]);
  const { data, error, loading } = useApiData<DonorPin[]>(
    "/api/donor/responses",
    [],
    version + liveVersion
  );
  const current = data[0];

  return (
    <article className={styles.card}>
      <strong>Meu PIN de Doação</strong>
      {loading ? <p className="muted">A carregar PIN real...</p> : null}
      {error ? <p className="muted">{error}</p> : null}
      {!current ? (
        <p className="muted">Aceite um pedido para gerar o seu PIN de doação.</p>
      ) : (
        <div className={styles.successCard}>
          <span className={styles.check}>✓</span>
          <div>
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
          <div className={styles.pinBox}>
            <small>PIN de confirmação</small>
            <strong>{current.pin}</strong>
          </div>
        </div>
      )}
    </article>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    accepted: "Dador a Caminho",
    arrived: "Chegou",
    cancelled: "Cancelado",
    completed: "Doação concluída",
    pin_validated: "PIN Validado"
  };
  return labels[status] ?? status;
}
