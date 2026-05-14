import { adminNavigation } from "@constants/adminNavigation";
import styles from "./adminCore.module.css";

export function AdminSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.drop} />
        <div>
          <strong>Sangue Angola</strong>
          <div className="muted">Administração Nacional</div>
        </div>
      </div>
      <nav aria-label="Navegação da administração nacional" className={styles.nav}>
        {adminNavigation.map((item, index) => (
          <a
            aria-current={index === 0 ? "page" : undefined}
            className={`${styles.navItem} ${index === 0 ? styles.active : ""}`}
            href={item.href}
            key={item.href}
          >
            <span>□</span>
            {item.label}
          </a>
        ))}
      </nav>
      <div className={styles.onlineCard}>
        <div className="eyebrow">Doadores Online</div>
        <h2>2.487</h2>
        <span className="pill">12% vs ontem</span>
        <svg className={styles.sparkline} viewBox="0 0 220 70">
          <polyline fill="none" points="0,58 24,44 48,50 72,32 96,35 120,20 144,26 168,12 192,18 220,7" stroke="#00c177" strokeWidth="4" />
        </svg>
      </div>
    </aside>
  );
}
