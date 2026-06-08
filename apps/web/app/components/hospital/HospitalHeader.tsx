"use client";

import { NotificationBell } from "../notifications/NotificationBell";
import { PilotFeedbackButton } from "../feedback/PilotFeedbackButton";
import { LogoutButton } from "../auth/LogoutButton";
import { useAuth } from "../auth/useAuth";
import styles from "./hospitalPortal.module.css";
import { useCurrentHospital } from "./useCurrentHospital";

export function HospitalHeader() {
  const { data: hospital, loading } = useCurrentHospital();
  const { session } = useAuth();
  const user = session?.user;

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
          <span className={styles.doctorAvatar}>{initials(user?.name)}</span>
          <span>
            <strong>{user?.name ?? "Utilizador do hospital"}</strong>
            <small>{roleLabel(user?.role)}</small>
          </span>
        </div>
        <div className={styles.logoutItem}><LogoutButton /></div>
      </div>
    </header>
  );
}

function initials(name?: string) {
  return (name ?? "Hospital")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function roleLabel(role?: string) {
  return role === "admin" ? "Administrador" : "Equipa hospitalar";
}
