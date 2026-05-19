"use client";

import type { Appointment, Donor } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { useRealtimeVersion } from "@hooks/useRealtimeVersion";
import { useMemo } from "react";
import { EmptyState } from "../ui/EmptyState";
import styles from "./hospitalPortal.module.css";
import { donorArrivals } from "./hospitalAgentService";
import { useCurrentHospital } from "./useCurrentHospital";

export function IncomingDonorsList() {
  const version = useRealtimeVersion();
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const fallback = useMemo(() => donorArrivals, [version]);
  const { data: appointments, usingApi } = useApiData<Appointment[]>(
    hospitalId ? `/api/appointments?hospitalId=${hospitalId}` : "/api/appointments?hospitalId=missing",
    [],
    version
  );
  const { data: donors } = useApiData<Donor[]>("/api/donors", [], version);
  const rows = appointments.length > 0
    ? appointments.map((appointment) => {
      const donor = donors.find((item) => item.id === appointment.donorId);
      return {
        bloodType: donor?.bloodType ?? "Compatível",
        eta: appointment.time,
        name: donor?.name ?? "Dador compatível",
        pin: appointment.pin,
        status: appointment.status
      };
    })
    : usingApi ? [] : fallback;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Dadores a Caminho</strong>
        <a className="muted" href="/hospital/donors">Lista ETA</a>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          message="Os dadores confirmados aparecerão aqui com ETA e PIN."
          title="Sem dadores a caminho"
        />
      ) : (
        <div className={styles.table}>
          {rows.map((donor) => (
          <article className={styles.donorRow} key={donor.pin}>
            <span>
              <strong>{donor.name}</strong><br />
              <span className={styles.rowMuted}>{donor.bloodType} · compatível</span>
            </span>
            <strong style={{ color: "#008a45" }}>{donor.eta}</strong>
            <span className="pill red">{donor.pin}<br /><span className={styles.rowMuted}>{donor.status}</span></span>
          </article>
          ))}
        </div>
      )}
      <a className={styles.footerLink} href="/hospital/donors">Ver todos os dadores</a>
    </section>
  );
}
