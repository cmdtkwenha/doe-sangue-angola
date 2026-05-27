"use client";

import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useSupabaseRealtimeVersion } from "@hooks/useSupabaseRealtimeVersion";
import { DonorResponseStatusBadge } from "../ui/DonorResponseStatusBadge";
import { EmptyState } from "../ui/EmptyState";
import { LoadingSkeleton } from "../ui/LoadingSkeleton";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";

type ScheduleDonor = {
  createdAt?: string;
  donorBloodType: string;
  donorName: string;
  eta: string;
  responseId: string;
  status: string;
};

export function AppointmentSchedule() {
  const version = useRealtimeVersion();
  const liveVersion = useSupabaseRealtimeVersion(["donor_responses", "blood_requests", "donors"]);
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: rows, loading, error } = useApiData<ScheduleDonor[]>(
    hospitalId ? "/api/hospital/accepted-donors" : "/api/appointments?hospitalId=missing",
    [],
    hospitalId.length + version + liveVersion
  );

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Agendamentos de Hoje</strong>
        <a className="muted" href="/hospital/schedule">Ver calendário</a>
      </div>
      {loading ? <LoadingSkeleton label="A sincronizar agendamentos vivos" /> : null}
      {error ? <p className={styles.rowMuted}>{error}</p> : null}
      {rows.length === 0 ? (
        <EmptyState
          message="Os agendamentos confirmados pelos dadores aparecerão aqui."
          title="Sem agendamentos"
        />
      ) : (
        <div className={styles.table}>
          {rows.map((row) => (
          <article className={styles.scheduleRow} key={row.responseId}>
            <span>{formatTime(row.createdAt)}</span>
            <span>
              <strong>{row.donorName}</strong><br />
              <span className={styles.rowMuted}>{row.donorBloodType} · ETA {row.eta}</span>
            </span>
            <DonorResponseStatusBadge status={row.status} />
          </article>
          ))}
        </div>
      )}
      <a className={styles.footerLink} href="/hospital/schedule">Ver todos os agendamentos</a>
    </section>
  );
}

function formatTime(value?: string) {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });
}
