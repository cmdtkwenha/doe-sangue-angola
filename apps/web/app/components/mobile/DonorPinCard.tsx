"use client";

import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import styles from "./mobileApp.module.css";

type DonorPin = {
  bloodRequestId: string;
  etaMinutes: number;
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
        <div className={styles.requestTop}>
          <span>
            <small>Hospital</small>
            <br />
            <strong>{current.hospitalName}</strong>
          </span>
          <span>
            <small>Pedido {current.requestBloodType} · ETA {current.etaMinutes} min</small>
            <br />
            <strong>{current.status}</strong>
          </span>
          <span className={`${styles.blood} ${styles.criticalText}`}>{current.pin}</span>
        </div>
      )}
    </article>
  );
}
