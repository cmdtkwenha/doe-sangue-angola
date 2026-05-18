import { hospitalNavigation } from "@constants/hospitalNavigation";
import { SidebarNav } from "../shell/SidebarNav";
import styles from "./hospitalPortal.module.css";

export function HospitalSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.drop} />
        <div>
          <strong>SANGUE ANGOLA</strong>
          <div style={{ color: "#ff4655", fontWeight: 800 }}>HOSPITAL</div>
        </div>
      </div>
      <SidebarNav
        activeClassName={styles.navItemActive}
        ariaLabel="Navegação do hospital"
        className={styles.nav}
        itemClassName={styles.navItem}
        items={hospitalNavigation}
        rootHref="/hospital"
      />
    </aside>
  );
}
