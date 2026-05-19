"use client";

import type { Appointment, Donor } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { EmptyState } from "../ui/EmptyState";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";

export function AppointmentSchedule() {
  const { data: hospital } = useCurrentHospital();
  const hospitalId = hospital?.id ?? "";
  const { data: appointments, loading, error } = useApiData<Appointment[]>(
    hospitalId ? `/api/appointments?hospitalId=${hospitalId}` : "/api/appointments?hospitalId=missing",
    [],
    hospitalId.length
  );
  const { data: donors } = useApiData<Donor[]>("/api/donors", [], 0);
  const donorById = new Map(donors.map((donor) => [donor.id, donor]));

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <strong>Agendamentos de Hoje</strong>
        <a className="muted" href="/hospital/schedule">Ver calendário</a>
      </div>
      {loading ? <p className={styles.rowMuted}>A carregar agendamentos reais...</p> : null}
      {error ? <p className={styles.rowMuted}>{error}</p> : null}
      {appointments.length === 0 ? (
        <EmptyState
          message="Os agendamentos confirmados pelos dadores aparecerão aqui."
          title="Sem agendamentos"
        />
      ) : (
        <div className={styles.table}>
          {appointments.map((appointment) => {
          const donor = donorById.get(appointment.donorId);
          return (
          <article className={styles.scheduleRow} key={appointment.id}>
            <span>{appointment.time}</span>
            <span>
              <strong>{donor?.name}</strong><br />
              <span className={styles.rowMuted}>{donor?.bloodType} · Doação</span>
            </span>
            <span className={appointment.status === "Pendente" ? "pill gold" : "pill"}>
              {appointment.status}
            </span>
          </article>
          );
          })}
        </div>
      )}
      <a className={styles.footerLink} href="/hospital/schedule">Ver todos os agendamentos</a>
    </section>
  );
}
