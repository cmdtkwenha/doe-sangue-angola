"use client";

import { NotificationBell } from "../notifications/NotificationBell";
import { PilotFeedbackButton } from "../feedback/PilotFeedbackButton";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";

export function HospitalHeader() {
  const { data: hospital, loading } = useCurrentHospital();

  return (
    <header className={styles.topbar}>
      <div className={styles.identity}>
        <span className={styles.avatar}>⌾</span>
        <div>
          <h1 className={styles.title}>
            {hospital?.name ?? (loading ? "A carregar hospital" : "Hospital não ligado")}
            {hospital?.verified ? <span className={styles.verified}>Verificado</span> : null}
          </h1>
          <div className={styles.location}>
            {hospital ? `${hospital.municipality}, ${hospital.province}` : "Escolha hospital no onboarding"}
          </div>
        </div>
      </div>
      <div className={styles.headerActions}>
        <NotificationBell />
        <PilotFeedbackButton compact />
        <div className={styles.doctor}>
          <span className={styles.doctorAvatar}>JM</span>
          <span>
            <strong>Dr. João Mendes</strong>
            <small>Administrador</small>
          </span>
        </div>
      </div>
    </header>
  );
}
