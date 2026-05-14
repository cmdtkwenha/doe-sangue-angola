import { NotificationBell } from "../notifications/NotificationBell";
import styles from "./mobileApp.module.css";

export function MobileHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.drop} />
        <span>
          <strong>{title}</strong>
          {subtitle ? <small><br />{subtitle}</small> : null}
        </span>
      </div>
      <NotificationBell />
    </header>
  );
}
