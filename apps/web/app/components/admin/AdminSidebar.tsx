"use client";

import { adminNavigation } from "@constants/adminNavigation";
import type { Donor } from "@doe-sangue-angola/shared-types";
import { useApiData } from "@hooks/useApiData";
import { SidebarNav } from "../shell/SidebarNav";
import styles from "./adminCore.module.css";

export function AdminSidebar() {
  const { data: donors } = useApiData<Donor[]>("/api/donors", [], 0);
  const available = donors.filter((donor) => donor.available).length;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.drop} />
        <div>
          <strong>Sangue Angola</strong>
          <div className="muted">Administração Nacional</div>
        </div>
      </div>
      <SidebarNav
        activeClassName={styles.active}
        ariaLabel="Navegação da administração nacional"
        className={styles.nav}
        itemClassName={styles.navItem}
        items={adminNavigation}
        rootHref="/admin"
      />
      <div className={styles.onlineCard}>
        <div className="eyebrow">Dadores Disponíveis</div>
        <h2>{available}</h2>
        <span className="pill">{donors.length} registados</span>
        <svg className={styles.sparkline} viewBox="0 0 220 70">
          <polyline fill="none" points="0,58 24,44 48,50 72,32 96,35 120,20 144,26 168,12 192,18 220,7" stroke="#00c177" strokeWidth="4" />
        </svg>
      </div>
    </aside>
  );
}
