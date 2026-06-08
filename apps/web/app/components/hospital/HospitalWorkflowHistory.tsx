"use client";

import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { DonorResponseStatusBadge, normalizeDonorResponseStatus } from "../ui/DonorResponseStatusBadge";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import styles from "./hospitalPortal.module.css";
import type { AcceptedDonor } from "./incomingDonorTypes";
import { useCurrentHospital } from "./useCurrentHospital";

export function HospitalWorkflowHistory() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["donor_responses", "blood_requests", "donors", "users"]);
  const { data: hospital } = useCurrentHospital();
  const path = hospital?.id ? "/api/hospital/accepted-donors?scope=all" : "/api/appointments?hospitalId=missing";
  const { data: rows, loading, error } = useApiData<AcceptedDonor[]>(path, [], version + liveVersion);
  const history = rows.filter((row) => isHistory(row.status));

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Histórico</strong>
        <a className="muted" href="/hospital/reports">Ver relatórios</a>
      </div>
      {loading ? <LoadingSkeleton label="A carregar histórico" /> : null}
      {error ? <p className={styles.rowMuted}>{error}</p> : null}
      {!history.length ? (
        <EmptyState
          message="Doações concluídas aparecerão aqui."
          title="Sem histórico operacional"
        />
      ) : (
        <div className={styles.table}>
          {history.map((row) => (
            <article className={styles.donorRow} key={row.responseId}>
              <span>
                <strong>{row.donorName}</strong><br />
                <span className={styles.rowMuted}>
                  {row.requestBloodType} · {row.hospitalName ?? hospital?.name ?? "Hospital"}
                </span>
              </span>
              <span className={styles.rowMuted}>{formatDate(row.createdAt ?? row.acceptedAt)}</span>
              <DonorResponseStatusBadge status={row.status} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function isHistory(status: string) {
  const normalized = normalizeDonorResponseStatus(status);
  return normalized === "Doação concluída";
}

function formatDate(value?: string) {
  if (!value) return "Data por confirmar";
  return new Date(value).toLocaleString("pt-AO", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit"
  });
}
