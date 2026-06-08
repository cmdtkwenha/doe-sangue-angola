"use client";

import { LogoutButton } from "../auth/LogoutButton";
import { useAuth } from "../auth/useAuth";
import { NotificationBell } from "../notifications/NotificationBell";
import { PilotFeedbackButton } from "../feedback/PilotFeedbackButton";
import styles from "./AdminHeader.module.css";

export function AdminHeader() {
  const { session } = useAuth();
  const user = session?.user;

  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>Centro de Operações Nacional</h1>
        <p className="muted" style={{ margin: "4px 0 0" }}>
          Monitorização em tempo real do sistema Sangue Angola
        </p>
      </div>
      <input
        className={styles.search}
        placeholder="Pesquisar por hospital, pedido, dador..."
        aria-label="Pesquisar"
      />
      <div className={styles.headerTools}>
        <NotificationBell all />
        <PilotFeedbackButton compact />
        <span className="pill">Português</span>
        <div className={styles.userChip}>
          <span className={styles.userAvatar}>{initials(user?.name)}</span>
          <span className={styles.userText}>
            <strong>{user?.name ?? "Administração"}</strong>
            <small>{roleLabel(user?.role)}</small>
          </span>
        </div>
        <div className={styles.logoutItem}><LogoutButton /></div>
      </div>
    </header>
  );
}

function initials(name?: string) {
  return (name ?? "Administração")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function roleLabel(role?: string) {
  const labels: Record<string, string> = {
    admin: "Administrador",
    hospital: "Hospital",
    donor: "Dador"
  };
  return labels[role ?? ""] ?? "Utilizador";
}
