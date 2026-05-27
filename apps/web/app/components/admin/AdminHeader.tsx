import { NotificationBell } from "../notifications/NotificationBell";
import styles from "./adminCore.module.css";

export function AdminHeader() {
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
        <span className="pill">Português</span>
        <strong>09:42</strong>
      </div>
    </header>
  );
}
