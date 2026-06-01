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
        <span className={styles.avatar} />
        <div>
          <strong style={{ fontSize: 20 }}>
            {hospital?.name ?? (loading ? "A carregar hospital" : "Hospital não ligado")}
          </strong>
          {hospital?.verified ? <span className="pill" style={{ marginLeft: 10 }}>Verificado</span> : null}
          <div className="muted">{hospital ? `${hospital.municipality}, ${hospital.province}` : "Escolha hospital no onboarding"}</div>
        </div>
      </div>
      <div className={styles.headerActions}>
        <PilotFeedbackButton compact />
        <NotificationBell />
        <strong>Dr. João Mendes</strong>
      </div>
    </header>
  );
}
